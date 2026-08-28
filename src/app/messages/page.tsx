"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  User,
  Users,
  X,
  RefreshCw,
} from "lucide-react";

import {
  useAppStore,
} from "@/src/core/store/app.store";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  messageApi,
} from "@/src/features/messages/api/message.api";

import {
  useMessageStore,
} from "@/src/features/messages/store/message.store";

import type {
  AnnouncementMessage,
  MessageUnit,
  PrivateMessage,
} from "@/src/features/messages/types/message.types";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Badge,
} from "@/components/ui/badge";

type Tab = "public" | "private";
type ChatRole = "malek" | "saken";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function MessagesPage() {
  const user = useAppStore((state) => state.user);
  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);

  const announcements = useMessageStore((state) => state.announcements);
  const units = useMessageStore((state) => state.units);
  const privateMessages = useMessageStore((state) => state.privateMessages);

  const isLoadingAnnouncements = useMessageStore((state) => state.isLoadingAnnouncements);
  const isLoadingUnits = useMessageStore((state) => state.isLoadingUnits);
  const isLoadingPrivate = useMessageStore((state) => state.isLoadingPrivate);

  const setAnnouncements = useMessageStore((state) => state.setAnnouncements);
  const setUnits = useMessageStore((state) => state.setUnits);
  const setPrivateMessages = useMessageStore((state) => state.setPrivateMessages);
  const setLoadingAnnouncements = useMessageStore((state) => state.setLoadingAnnouncements);
  const setLoadingUnits = useMessageStore((state) => state.setLoadingUnits);
  const setLoadingPrivate = useMessageStore((state) => state.setLoadingPrivate);

  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("public");
  const [selectedMessage, setSelectedMessage] = useState<AnnouncementMessage | null>(null);
  
  // State برای پیام خصوصی
  const [selectedUnitForChat, setSelectedUnitForChat] = useState<MessageUnit | null>(null);
  const [targetRole, setTargetRole] = useState<ChatRole>("malek");
  const [selectedUserRole, setSelectedUserRole] = useState<"malek" | "saken" | null>(null);
  const [isPollingActive, setIsPollingActive] = useState(false);

  const [subject, setSubject] = useState("");
  const [publicMessage, setPublicMessage] = useState("");
  const [privateMessage, setPrivateMessage] = useState("");
  const [sending, setSending] = useState(false);

  const buildingId = selectedBuilding?.ids ?? selectedUnit?.ids ?? "";
  const isManager = Boolean(
    user?.iduser && selectedBuilding?.idmodir === user.iduser
  );

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // تشخیص نقش کاربر
  // ============================================

  const getUserRoleState = useCallback((): "malek" | "saken" | "both" | null => {
    if (!user?.iduser || !selectedUnit) return null;

    const isMalek = selectedUnit.malek === user.iduser;
    const isSaken = selectedUnit.saken === user.iduser;

    if (isMalek && isSaken) return "both";
    if (isMalek) return "malek";
    if (isSaken) return "saken";
    return null;
  }, [user?.iduser, selectedUnit]);

  const userRoleState = getUserRoleState();

  const showRoleSelector = userRoleState === "both" && !selectedUserRole && tab === "private";

  // ============================================
  // دریافت اعلان‌ها
  // ============================================

  useEffect(() => {
    if (!buildingId) return;

    const load = async () => {
      try {
        setLoadingAnnouncements(true);
        const result = await messageApi.getAnnouncements(buildingId);
        setAnnouncements(result);
      } catch (err) {
        console.error("Get announcements error:", err);
        setError("دریافت اعلانات ناموفق بود.");
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    void load();
  }, [buildingId]);

  // ============================================
  // دریافت واحدها (فقط مدیر)
  // ============================================

  useEffect(() => {
    if (!buildingId || !isManager || tab !== "private") return;

    const load = async () => {
      try {
        setLoadingUnits(true);
        const result = await messageApi.getUnits(buildingId);
        setUnits(result);

        if (result.length > 0 && !selectedUnitForChat) {
          setSelectedUnitForChat(result[0]);
        }
      } catch (err) {
        console.error("Get units error:", err);
        setError("دریافت واحدها ناموفق بود.");
      } finally {
        setLoadingUnits(false);
      }
    };

    void load();
  }, [buildingId, isManager, tab]);

  // ============================================
  // تابع بارگذاری پیام‌های خصوصی
  // ============================================

  const loadPrivateMessages = useCallback(async () => {
    // بررسی شرایط
    if (!buildingId) {
      console.log("⚠️ No buildingId");
      return;
    }

    if (tab !== "private") {
      console.log("⚠️ Not in private tab");
      return;
    }

    // تعیین unitId
    let unitId = "";
    if (isManager) {
      unitId = selectedUnitForChat?.idv ?? "";
    } else {
      unitId = selectedUnit?.idv ?? "";
    }

    if (!unitId) {
      console.log("⚠️ No unit selected");
      return;
    }

    // تعیین نقش
    let role: "modir" | "malek" | "saken" | "maleksaken";
    let target: "malek" | "saken" | undefined;

    if (isManager) {
      role = "modir";
      target = targetRole;
    } else if (userRoleState === "both") {
      role = "maleksaken";
      target = selectedUserRole || "malek";
    } else if (userRoleState === "malek" || userRoleState === "saken") {
      role = userRoleState;
      target = undefined;
    } else {
      console.log("⚠️ No valid role");
      return;
    }

    console.log("🔍 Loading messages:", { unitId, role, target });

    try {
      setLoadingPrivate(true);
      const result = await messageApi.getPrivateMessages(
        buildingId,
        unitId,
        role,
        target
      );
      setPrivateMessages(result);
      console.log("✅ Messages loaded:", result.length);
    } catch (err) {
      console.error("❌ Load private messages error:", err);
      setError("دریافت پیام‌های خصوصی با خطا مواجه شد.");
    } finally {
      setLoadingPrivate(false);
    }
  }, [
    buildingId,
    tab,
    isManager,
    selectedUnitForChat,
    selectedUnit?.idv,
    targetRole,
    userRoleState,
    selectedUserRole,
    setPrivateMessages,
    setLoadingPrivate,
    setError,
  ]);

  // ============================================
  // Effect برای بارگذاری پیام‌ها و Polling
  // ============================================

  useEffect(() => {
    // توقف Polling اگر در تب private نیستیم
    if (tab !== "private" || !buildingId) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsPollingActive(false);
      }
      return;
    }

    // بارگذاری اولیه
    void loadPrivateMessages();

    // راه‌اندازی Polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    pollingRef.current = setInterval(() => {
      void loadPrivateMessages();
    }, 10000);

    setIsPollingActive(true);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsPollingActive(false);
      }
    };
  }, [
    buildingId,
    tab,
    loadPrivateMessages,
  ]);

  // ============================================
  // ارسال اعلان
  // ============================================

  const handleSendAnnouncement = async () => {
    if (!isManager || !user?.iduser || !buildingId) {
      setError("شما دسترسی به این بخش ندارید.");
      return;
    }

    if (!subject.trim()) {
      setError("موضوع اعلان را وارد کنید.");
      return;
    }

    if (!publicMessage.trim()) {
      setError("متن اعلان را وارد کنید.");
      return;
    }

    try {
      setSending(true);
      setError("");

      const result = await messageApi.sendAnnouncement(
        buildingId,
        user.iduser,
        subject.trim(),
        publicMessage.trim()
      );

      if (!result.success) {
        setError(result.message ?? "ارسال اعلان انجام نشد.");
        return;
      }

      setSubject("");
      setPublicMessage("");

      const fresh = await messageApi.getAnnouncements(buildingId);
      setAnnouncements(fresh);
    } catch (err) {
      console.error("Send announcement error:", err);
      setError("ارسال اعلان با خطا مواجه شد.");
    } finally {
      setSending(false);
    }
  };

  // ============================================
  // حذف اعلان
  // ============================================

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!isManager || !user?.iduser || !buildingId) {
      setError("شما دسترسی به این بخش ندارید.");
      return;
    }

    const confirmed = window.confirm("آیا از حذف این اعلان اطمینان دارید؟");
    if (!confirmed) return;

    try {
      const result = await messageApi.deleteAnnouncement(
        buildingId,
        user.iduser,
        announcementId
      );

      if (!result.success) {
        setError(result.message ?? "حذف اعلان انجام نشد.");
        return;
      }

      const fresh = await messageApi.getAnnouncements(buildingId);
      setAnnouncements(fresh);
    } catch (err) {
      console.error("Delete announcement error:", err);
      setError("حذف اعلان با خطا مواجه شد.");
    }
  };

  // ============================================
  // ارسال پیام خصوصی
  // ============================================

  const handleSendPrivate = async () => {
    if (!user?.iduser || !buildingId) {
      setError("اطلاعات کاربری کامل نیست.");
      return;
    }

    // تعیین unitId
    let unitId = "";
    if (isManager) {
      unitId = selectedUnitForChat?.idv ?? "";
    } else {
      unitId = selectedUnit?.idv ?? "";
    }

    if (!unitId) {
      setError("واحد موردنظر مشخص نیست.");
      return;
    }

    if (!privateMessage.trim()) {
      setError("متن پیام را وارد کنید.");
      return;
    }

    // تعیین نقش
    let role: "modir" | "malek" | "saken" | "maleksaken";
    let target: "malek" | "saken" | undefined;

    if (isManager) {
      role = "modir";
      target = targetRole;
    } else if (userRoleState === "both") {
      role = "maleksaken";
      target = selectedUserRole || "malek";
    } else if (userRoleState === "malek" || userRoleState === "saken") {
      role = userRoleState;
      target = undefined;
    } else {
      setError("نقش کاربری مشخص نیست.");
      return;
    }

    console.log("📤 Sending message:", { unitId, role, target, message: privateMessage });

    try {
      setSending(true);
      setError("");

      const result = await messageApi.sendPrivateMessage(
        buildingId,
        unitId,
        user.iduser,
        role,
        privateMessage.trim(),
        target || "malek"
      );

      if (!result.success) {
        setError(result.message ?? "ارسال پیام انجام نشد.");
        return;
      }

      setPrivateMessage("");
      
      // بارگذاری مجدد پیام‌ها بعد از ارسال
      await loadPrivateMessages();
    } catch (err) {
      console.error("Send private message error:", err);
      setError("ارسال پیام خصوصی با خطا مواجه شد.");
    } finally {
      setSending(false);
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div dir="rtl" className="space-y-5 px-4 py-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">پیام‌ها و اعلانات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedBuilding?.names ?? "ساختمان"}
          </p>
        </div>
      </div>

      {/* دیالوگ انتخاب نقش */}
      {showRoleSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-w-sm w-full rounded-2xl bg-background p-6 shadow-xl">
            <h3 className="text-lg font-bold text-center">انتخاب نقش</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              شما هم مالک و هم ساکن این واحد هستید. لطفاً نقشی که می‌خواهید پیام ارسال کنید را انتخاب کنید:
            </p>
            <div className="mt-4 flex gap-3">
              <Button className="flex-1" variant="outline" onClick={() => setSelectedUserRole("malek")}>
                مالک
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => setSelectedUserRole("saken")}>
                ساکن
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-2 rounded-xl border p-1">
        <button
          type="button"
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-medium transition",
            tab === "public" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          )}
          onClick={() => setTab("public")}
        >
          تابلو اعلانات
        </button>
        <button
          type="button"
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-medium transition",
            tab === "private" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          )}
          onClick={() => setTab("private")}
        >
          پیام خصوصی
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ========== PUBLIC TAB ========== */}
      {tab === "public" && (
        <>
          {isLoadingAnnouncements ? (
            <Card>
              <CardContent className="flex min-h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </CardContent>
            </Card>
          ) : announcements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                اعلان عمومی ثبت نشده است.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {announcements.map((item) => (
                <Card key={item.id} className="cursor-pointer" onClick={() => setSelectedMessage(item)}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="mt-1 h-5 w-5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{item.subject}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.message}</p>
                        <div className="mt-3 flex justify-between gap-3 text-xs text-muted-foreground">
                          <span>{item.senderName}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                      {isManager && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteAnnouncement(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {isManager && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" /> ارسال اعلان جدید
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>موضوع</Label>
                  <Input maxLength={50} value={subject} onChange={(e) => setSubject(e.target.value)} disabled={sending} />
                </div>
                <div className="space-y-2">
                  <Label>متن اعلان</Label>
                  <Textarea
                    maxLength={500}
                    value={publicMessage}
                    onChange={(e) => setPublicMessage(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <Button className="w-full" disabled={sending} onClick={() => void handleSendAnnouncement()}>
                  <Send className="ml-2 h-4 w-4" />
                  {sending ? "در حال ارسال..." : "ارسال اعلان"}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ========== PRIVATE TAB ========== */}
      {tab === "private" && (
        <>
          {/* انتخاب واحد و نقش برای مدیر */}
          {isManager && (
            <Card>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label>واحد</Label>
                  {isLoadingUnits ? (
                    <div className="flex justify-center py-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedUnitForChat?.idv ?? ""}
                        onChange={(e) => {
                          const selected = units.find((u) => u.idv === e.target.value);
                          setSelectedUnitForChat(selected ?? null);
                        }}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="">واحد را انتخاب کنید</option>
                        {units.map((unit) => (
                          <option key={unit.idv} value={unit.idv}>
                            {unit.namev}
                          </option>
                        ))}
                      </select>

                      {selectedUnitForChat && (
                        <div className="flex gap-3 mt-2">
                          {parseInt(selectedUnitForChat.unreadResident) > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <Users className="h-3 w-3" /> ساکن: {selectedUnitForChat.unreadResident}
                            </Badge>
                          )}
                          {parseInt(selectedUnitForChat.unreadManager) > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <User className="h-3 w-3" /> مالک: {selectedUnitForChat.unreadManager}
                            </Badge>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>گفتگو با</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setTargetRole("malek")}
                      className={cn(
                        "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition",
                        targetRole === "malek" ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                    >
                      مالک
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetRole("saken")}
                      className={cn(
                        "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition",
                        targetRole === "saken" ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                      )}
                    >
                      ساکن
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* نمایش نقش کاربر غیر مدیر */}
          {!isManager && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    گفتگو با مدیر (
                    {userRoleState === "malek" && "مالک"}
                    {userRoleState === "saken" && "ساکن"}
                    {userRoleState === "both" && selectedUserRole === "malek" && "مالک"}
                    {userRoleState === "both" && selectedUserRole === "saken" && "ساکن"}
                    )
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* لیست پیام‌ها */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> گفتگو
                {isPollingActive && (
                  <span className="text-xs text-muted-foreground mr-auto">
                    <RefreshCw className="inline h-3 w-3 animate-spin ml-1" /> بروزرسانی خودکار
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPrivate ? (
                <div className="flex min-h-48 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : privateMessages.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  هنوز پیامی در این گفتگو ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-3">
                  {privateMessages.map((item) => (
                    <div key={item.id} className="space-y-2">
                      {item.managerMessage && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-muted p-4">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3" /> {item.managerName || "مدیر"}
                            </div>
                            <p className="whitespace-pre-wrap text-sm">{item.managerMessage}</p>
                            <p className="mt-2 text-[10px] text-muted-foreground">{item.managerDate}</p>
                          </div>
                        </div>
                      )}

                      {item.userMessage && (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-primary/10 p-4">
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3" /> {item.userName || "کاربر"}
                            </div>
                            <p className="whitespace-pre-wrap text-sm">{item.userMessage}</p>
                            <p className="mt-2 text-[10px] text-muted-foreground">{item.userDate}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ارسال پیام */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-end gap-3">
                <Textarea
                  value={privateMessage}
                  onChange={(e) => setPrivateMessage(e.target.value)}
                  placeholder="متن پیام..."
                  disabled={sending}
                  className="min-h-20"
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  disabled={sending}
                  onClick={() => void handleSendPrivate()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal اعلان کامل */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{selectedMessage.subject}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedMessage(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-5 whitespace-pre-wrap text-sm leading-7">{selectedMessage.message}</div>
            <div className="mt-5 border-t pt-4 text-xs text-muted-foreground">
              <div className="flex justify-between gap-3">
                <span>ارسال کننده: {selectedMessage.senderName}</span>
                <span>{selectedMessage.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}