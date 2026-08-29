// src/app/units/[id]/page.tsx
"use client";

import {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  useRouter,
  useParams,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowRight,
  Edit,
  Trash2,
  Users,
  Home,
  Ruler,
  ParkingSquare,
  Warehouse,
  Zap,
  Droplets,
  Flame,
  FileText,
  Clock,
  User,
  Phone,
  Calendar,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  Pencil,
  UserRound,
  CalendarDays,
} from "lucide-react";

import {
  useAppStore,
} from "@/src/core/store/app.store";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  unitDetailApi,
} from "@/src/features/units/api/unit-detail.api";

import {
  unitPeopleApi,
  getTodayPersian,
  isValidPersianDate,
} from "@/src/features/units/api/unit-people.api";

import {
  unitHistoryApi,
} from "@/src/features/units/api/unit-history.api";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Separator,
} from "@/components/ui/separator";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Skeleton,
} from "@/components/ui/skeleton";

// ============================================
// Types
// ============================================

interface UnitDetail {
  idvahed: string;
  namevahed: string;
  metter: string;
  bargh: string;
  aab: string;
  gaz: string;
  parking: string;
  anbari: string;
  tozihat: string;
  stateFullEmpty: 'full' | 'empty';
  dateFrom: string;
}

interface Resident {
  idnaghsh: string;
  iduser: string;
  nameuser: string;
  phone: string;
  datestart: string;
  count: string;
  naghsh: 'malek' | 'saken';
  status?: 'active' | 'ended';
  endDate?: string;
}

// ============================================
// Dialog Types for Tenant Edit
// ============================================

type EditTenantDialogType = 
  | 'phone'
  | 'date'
  | 'count'
  | null;

interface EditTenantData {
  type: EditTenantDialogType;
  tenant: Resident | null;
  phone: string;
  date: string;
  count: string;
}

// ============================================
// Component
// ============================================

export default function UnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params?.id as string;

  // Store
  const user = useAppStore((state) => state.user);
  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);

  // State - Unit Detail
  const [unitDetail, setUnitDetail] = useState<UnitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State - People
  const [owners, setOwners] = useState<Resident[]>([]);
  const [tenants, setTenants] = useState<Resident[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);
  const [peopleError, setPeopleError] = useState<string | null>(null);

  // State - History
  const [ownerHistory, setOwnerHistory] = useState<Resident[]>([]);
  const [tenantHistory, setTenantHistory] = useState<Resident[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // State - Edit Unit
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UnitDetail>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State - Delete Dialog (برای مالک و ساکن)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Resident | null>(null);
  const [deleteDate, setDeleteDate] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // State - Add Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addPersonType, setAddPersonType] = useState<'malek' | 'saken'>('malek');
  const [addPhone, setAddPhone] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addCount, setAddCount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // State - Edit Tenant (ساکن)
  const [editTenantDialog, setEditTenantDialog] = useState<EditTenantData>({
    type: null,
    tenant: null,
    phone: "",
    date: "",
    count: "",
  });
  const [isEditingTenant, setIsEditingTenant] = useState(false);
  const [editTenantError, setEditTenantError] = useState<string | null>(null);
  const [editTenantSuccess, setEditTenantSuccess] = useState(false);

  // State - Edit Owner (مالک)
  const [editOwnerDialog, setEditOwnerDialog] = useState<{
    type: 'phone' | 'date' | null;
    owner: Resident | null;
    phone: string;
    date: string;
  }>({
    type: null,
    owner: null,
    phone: "",
    date: "",
  });
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [editOwnerError, setEditOwnerError] = useState<string | null>(null);
  const [editOwnerSuccess, setEditOwnerSuccess] = useState(false);

  const isManager = Boolean(
    user?.iduser && selectedBuilding?.idmodir === user.iduser
  );

  // ============================================
  // Load Data
  // ============================================

  const loadUnitDetail = useCallback(async () => {
    if (!unitId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await unitDetailApi.getOne(unitId);
      setUnitDetail(result);
      setEditData(result);
    } catch (err) {
      console.error("Load unit detail error:", err);
      setError("دریافت اطلاعات واحد با خطا مواجه شد.");
    } finally {
      setIsLoading(false);
    }
  }, [unitId]);

  const loadPeople = useCallback(async () => {
    if (!unitId) return;

    setIsLoadingPeople(true);
    setPeopleError(null);

    try {
      const result = await unitPeopleApi.getByUnit(unitId);
      const ownersList = result.filter((p) => p.naghsh === 'مالک');
      const tenantsList = result.filter((p) => p.naghsh === 'ساکن');
      setOwners(ownersList);
      setTenants(tenantsList);

      // بعد از دریافت مالک و ساکن، سوابق رو هم بارگذاری کن
      if (ownersList.length > 0 || tenantsList.length > 0) {
        await loadHistory(ownersList, tenantsList);
      }
    } catch (err) {
      console.error("Load people error:", err);
      setPeopleError("دریافت اطلاعات ساکنان با خطا مواجه شد.");
    } finally {
      setIsLoadingPeople(false);
    }
  }, [unitId]);

  const loadHistory = useCallback(async (ownersList: Resident[], tenantsList: Resident[]) => {
    if (!unitId) return;

    setIsLoadingHistory(true);

    try {
      // دریافت سوابق مالک
      if (ownersList.length > 0) {
        const ownerHistoryData = await unitHistoryApi.getHistory({
          unitId,
          userId: ownersList[0]?.iduser || "",
        });
        setOwnerHistory(ownerHistoryData.map((item) => ({
          ...item,
          naghsh: 'malek' as const,
          nameuser: ownersList[0]?.nameuser || "مالک",
          phone: ownersList[0]?.phone || "",
          datestart: item.startDate,
          count: item.count,
          status: item.status,
          endDate: item.endDate,
        })));
      }

      // دریافت سوابق ساکن
      if (tenantsList.length > 0) {
        const tenantHistoryData = await unitHistoryApi.getHistory({
          unitId,
          userId: tenantsList[0]?.iduser || "",
        });
        setTenantHistory(tenantHistoryData.map((item) => ({
          ...item,
          naghsh: 'saken' as const,
          nameuser: tenantsList[0]?.nameuser || "ساکن",
          phone: tenantsList[0]?.phone || "",
          datestart: item.startDate,
          count: item.count,
          status: item.status,
          endDate: item.endDate,
        })));
      }
    } catch (error) {
      console.error("Load history error:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [unitId]);

  useEffect(() => {
    if (unitId) {
      void loadUnitDetail();
      void loadPeople();
    }
  }, [unitId, loadUnitDetail, loadPeople]);

  // ============================================
  // Edit Unit
  // ============================================

  const handleEditChange = (field: keyof UnitDetail, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUnit = async () => {
    if (!unitId || !editData) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const result = await unitDetailApi.update(unitId, editData);

      if (result.success) {
        setSaveSuccess(true);
        setIsEditing(false);
        await loadUnitDetail();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.message || "ذخیره اطلاعات با خطا مواجه شد.");
      }
    } catch (err) {
      console.error("Save unit error:", err);
      setSaveError("ذخیره اطلاعات با خطا مواجه شد.");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // Edit Tenant
  // ============================================

  const openEditTenantPhone = (tenant: Resident) => {
    setEditTenantDialog({
      type: 'phone',
      tenant,
      phone: tenant.phone || "",
      date: tenant.datestart || "",
      count: tenant.count || "",
    });
    setEditTenantError(null);
    setEditTenantSuccess(false);
  };

  const openEditTenantDate = (tenant: Resident) => {
    setEditTenantDialog({
      type: 'date',
      tenant,
      phone: tenant.phone || "",
      date: tenant.datestart || "",
      count: tenant.count || "",
    });
    setEditTenantError(null);
    setEditTenantSuccess(false);
  };

  const openEditTenantCount = (tenant: Resident) => {
    setEditTenantDialog({
      type: 'count',
      tenant,
      phone: tenant.phone || "",
      date: tenant.datestart || "",
      count: tenant.count || "",
    });
    setEditTenantError(null);
    setEditTenantSuccess(false);
  };

  const handleEditTenant = async () => {
    const { type, tenant, phone, date, count } = editTenantDialog;

    if (!tenant) return;

    setIsEditingTenant(true);
    setEditTenantError(null);
    setEditTenantSuccess(false);

    try {
      let result;

      if (type === 'phone') {
        if (!phone || phone.length !== 11) {
          setEditTenantError("شماره موبایل را به صورت صحیح وارد کنید (۱۱ رقم).");
          setIsEditingTenant(false);
          return;
        }

        result = await unitPeopleApi.editTenantPhone({
          idnaghsh: tenant.idnaghsh,
          phone: phone,
        });
      } else if (type === 'date') {
        if (!date || date.length !== 10) {
          setEditTenantError("تاریخ را به صورت صحیح وارد کنید (مثال: 1404/01/01).");
          setIsEditingTenant(false);
          return;
        }

        if (!isValidPersianDate(date)) {
          setEditTenantError("تاریخ وارد شده معتبر نیست. فرمت صحیح: 1404/01/01");
          setIsEditingTenant(false);
          return;
        }

        result = await unitPeopleApi.editTenantDate({
          idnaghsh: tenant.idnaghsh,
          date: date,
        });
      } else if (type === 'count') {
        if (!count || parseInt(count) <= 0) {
          setEditTenantError("تعداد نفرات را به صورت صحیح وارد کنید.");
          setIsEditingTenant(false);
          return;
        }

        result = await unitPeopleApi.editTenantCount({
          idnaghsh: tenant.idnaghsh,
          count: count,
        });
      } else {
        setEditTenantError("نوع ویرایش نامعتبر است.");
        setIsEditingTenant(false);
        return;
      }

      if (result?.success) {
        setEditTenantSuccess(true);
        setTimeout(() => {
          setEditTenantDialog({
            type: null,
            tenant: null,
            phone: "",
            date: "",
            count: "",
          });
          setEditTenantSuccess(false);
          void loadPeople();
        }, 1000);
      } else {
        setEditTenantError(result?.message || "ویرایش با خطا مواجه شد.");
      }
    } catch (err) {
      console.error("Edit tenant error:", err);
      setEditTenantError("ویرایش با خطا مواجه شد.");
    } finally {
      setIsEditingTenant(false);
    }
  };

  // ============================================
  // Edit Owner
  // ============================================

  const openEditOwnerPhone = (owner: Resident) => {
    setEditOwnerDialog({
      type: 'phone',
      owner,
      phone: owner.phone || "",
      date: owner.datestart || "",
    });
    setEditOwnerError(null);
    setEditOwnerSuccess(false);
  };

  const openEditOwnerDate = (owner: Resident) => {
    setEditOwnerDialog({
      type: 'date',
      owner,
      phone: owner.phone || "",
      date: owner.datestart || "",
    });
    setEditOwnerError(null);
    setEditOwnerSuccess(false);
  };

  const handleEditOwner = async () => {
    const { type, owner, phone, date } = editOwnerDialog;

    if (!owner) return;

    setIsEditingOwner(true);
    setEditOwnerError(null);
    setEditOwnerSuccess(false);

    try {
      let result;

      if (type === 'phone') {
        if (!phone || phone.length !== 11) {
          setEditOwnerError("شماره موبایل را به صورت صحیح وارد کنید (۱۱ رقم).");
          setIsEditingOwner(false);
          return;
        }

        result = await unitPeopleApi.editOwnerPhone({
          idnaghsh: owner.idnaghsh,
          phone: phone,
        });
      } else if (type === 'date') {
        if (!date || date.length !== 10) {
          setEditOwnerError("تاریخ را به صورت صحیح وارد کنید (مثال: 1404/01/01).");
          setIsEditingOwner(false);
          return;
        }

        if (!isValidPersianDate(date)) {
          setEditOwnerError("تاریخ وارد شده معتبر نیست. فرمت صحیح: 1404/01/01");
          setIsEditingOwner(false);
          return;
        }

        result = await unitPeopleApi.editOwnerDate({
          idnaghsh: owner.idnaghsh,
          date: date,
        });
      } else {
        setEditOwnerError("نوع ویرایش نامعتبر است.");
        setIsEditingOwner(false);
        return;
      }

      if (result?.success) {
        setEditOwnerSuccess(true);
        setTimeout(() => {
          setEditOwnerDialog({
            type: null,
            owner: null,
            phone: "",
            date: "",
          });
          setEditOwnerSuccess(false);
          void loadPeople();
        }, 1000);
      } else {
        setEditOwnerError(result?.message || "ویرایش با خطا مواجه شد.");
      }
    } catch (err) {
      console.error("Edit owner error:", err);
      setEditOwnerError("ویرایش با خطا مواجه شد.");
    } finally {
      setIsEditingOwner(false);
    }
  };

  // ============================================
  // Delete Person (Owner/Tenant)
  // ============================================

  const handleDeletePerson = async () => {
    if (!deleteItem) return;

    if (!deleteDate || deleteDate.length !== 10) {
      setDeleteError("تاریخ را به صورت صحیح وارد کنید (مثال: 1404/01/15)");
      return;
    }

    if (!isValidPersianDate(deleteDate)) {
      setDeleteError("تاریخ وارد شده معتبر نیست. فرمت صحیح: 1404/01/01");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await unitPeopleApi.deletePerson(
        deleteItem.idnaghsh,
        deleteDate
      );

      if (result.success) {
        setDeleteDialogOpen(false);
        setDeleteItem(null);
        setDeleteDate("");
        await loadPeople();
      } else {
        setDeleteError(result.message || "حذف با خطا مواجه شد.");
      }
    } catch (err) {
      console.error("Delete person error:", err);
      setDeleteError("حذف با خطا مواجه شد.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (person: Resident) => {
    setDeleteItem(person);
    setDeleteDate(getTodayPersian());
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  // ============================================
  // Add Person
  // ============================================

  const handleAddPerson = async () => {
    if (!unitId) return;

    if (!addPhone || addPhone.length !== 11) {
      setAddError("شماره موبایل را به صورت صحیح وارد کنید (۱۱ رقم).");
      return;
    }

    if (!addDate || addDate.length !== 10) {
      setAddError("تاریخ را به صورت صحیح وارد کنید (مثال: 1404/01/01).");
      return;
    }

    if (!isValidPersianDate(addDate)) {
      setAddError("تاریخ وارد شده معتبر نیست. فرمت صحیح: 1404/01/01");
      return;
    }

    if (addPersonType === 'saken' && !addCount) {
      setAddError("تعداد نفرات را وارد کنید.");
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      const result = await unitPeopleApi.addPerson({
        unitId,
        phone: addPhone,
        date: addDate,
        count: addCount || "0",
        naghsh: addPersonType,
      });

      if (result.success) {
        setAddDialogOpen(false);
        setAddPhone("");
        setAddDate("");
        setAddCount("");
        await loadPeople();
      } else {
        setAddError(result.message || "افزودن با خطا مواجه شد.");
      }
    } catch (err) {
      console.error("Add person error:", err);
      setAddError("افزودن با خطا مواجه شد.");
    } finally {
      setIsAdding(false);
    }
  };

  const openAddDialog = (type: 'malek' | 'saken') => {
    setAddPersonType(type);
    setAddPhone("");
    setAddDate(getTodayPersian());
    setAddCount("");
    setAddError(null);
    setAddDialogOpen(true);
  };

  // ============================================
  // Navigate to History
  // ============================================

  const goToHistory = (userId: string) => {
    router.push(`/units/${unitId}/history?userId=${userId}`);
  };

  // ============================================
  // Render
  // ============================================

  if (isLoading) {
    return (
      <div className="space-y-5 px-4 py-5">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-5">
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="mr-auto"
            onClick={() => void loadUnitDetail()}
          >
            تلاش مجدد
          </Button>
        </Alert>
      </div>
    );
  }

  if (!unitDetail) {
    return (
      <div className="flex min-h-48 items-center justify-center px-4">
        <p className="text-muted-foreground">اطلاعات واحد یافت نشد.</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-5 px-4 py-5">
      {/* ============================================
          Header
          ============================================ */}
      <div className="flex items-center gap-3">
        <Link
          href="/units"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold truncate">
            {unitDetail.namevahed}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground truncate">
            {selectedBuilding?.names || "ساختمان"}
          </p>
        </div>

        {isManager && (
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (isEditing) {
                void handleSaveUnit();
              } else {
                setIsEditing(true);
                setEditData(unitDetail);
                setSaveError(null);
                setSaveSuccess(false);
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ذخیره
              </>
            ) : isEditing ? (
              "ذخیره تغییرات"
            ) : (
              <>
                <Edit className="ml-2 h-4 w-4" />
                ویرایش
              </>
            )}
          </Button>
        )}
      </div>

      {/* Save Success */}
      {saveSuccess && (
        <Alert className="border-success/30 bg-success/10 text-success dark:bg-success/15 dark:text-success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            اطلاعات واحد با موفقیت ذخیره شد.
          </AlertDescription>
        </Alert>
      )}

      {/* Save Error */}
      {saveError && (
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* ============================================
          Unit Info Card
          ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            مشخصات واحد
          </CardTitle>
          <CardDescription>
            اطلاعات پایه و امکانات واحد
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">نام واحد</Label>
              {isEditing ? (
                <Input
                  value={editData?.namevahed || ""}
                  onChange={(e) =>
                    handleEditChange("namevahed", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{unitDetail.namevahed}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                متراژ (متر مربع)
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editData?.metter || ""}
                  onChange={(e) =>
                    handleEditChange("metter", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{unitDetail.metter}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground">وضعیت</Label>
              <Badge
                variant={unitDetail.stateFullEmpty === 'full' ? 'success' : 'secondary'}
              >
                {unitDetail.stateFullEmpty === 'full' ? 'پر' : 'خالی'}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                تاریخ شروع
              </Label>
              <p className="font-medium">{unitDetail.dateFrom || "—"}</p>
            </div>

            <Separator className="col-span-full" />

            <div className="space-y-1.5">
              <Label className="text-muted-foreground flex items-center gap-1">
                <ParkingSquare className="h-4 w-4" />
                شماره پارکینگ
              </Label>
              {isEditing ? (
                <Input
                  value={editData?.parking || ""}
                  onChange={(e) =>
                    handleEditChange("parking", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{unitDetail.parking || "—"}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Warehouse className="h-4 w-4" />
                شماره انباری
              </Label>
              {isEditing ? (
                <Input
                  value={editData?.anbari || ""}
                  onChange={(e) =>
                    handleEditChange("anbari", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{unitDetail.anbari || "—"}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Zap className="h-4 w-4" />
                شناسه برق
              </Label>
              {isEditing ? (
                <Input
                  value={editData?.bargh || ""}
                  onChange={(e) =>
                    handleEditChange("bargh", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{unitDetail.bargh || "—"}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Droplets className="h-4 w-4" />
                شناسه آب
              </Label>
              {isEditing ? (
                <Input
                  value={editData?.aab || ""}
                  onChange={(e) =>
                    handleEditChange("aab", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{unitDetail.aab || "—"}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground flex items-center gap-1">
                <Flame className="h-4 w-4" />
                شناسه گاز
              </Label>
              {isEditing ? (
                <Input
                  value={editData?.gaz || ""}
                  onChange={(e) =>
                    handleEditChange("gaz", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{unitDetail.gaz || "—"}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-full">
              <Label className="text-muted-foreground flex items-center gap-1">
                <FileText className="h-4 w-4" />
                توضیحات
              </Label>
              {isEditing ? (
                <Input
                  value={editData?.tozihat || ""}
                  onChange={(e) =>
                    handleEditChange("tozihat", e.target.value)
                  }
                />
              ) : (
                <p className="font-medium">{unitDetail.tozihat || "—"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          Owners & Tenants
          ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            مالک و ساکنان
          </CardTitle>
          <CardDescription>
            اطلاعات مالک و ساکنان این واحد
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="owners" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="owners">
                مالک ({owners.length})
              </TabsTrigger>
              <TabsTrigger value="tenants">
                ساکنان ({tenants.length})
              </TabsTrigger>
            </TabsList>

            {/* ============================================
                Owners Tab
                ============================================ */}
            <TabsContent value="owners" className="mt-4 space-y-4">
              {isLoadingPeople ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : peopleError ? (
                <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{peopleError}</AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-auto"
                    onClick={() => void loadPeople()}
                  >
                    تلاش مجدد
                  </Button>
                </Alert>
              ) : owners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <User className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    مالکی برای این واحد ثبت نشده است.
                  </p>
                </div>
              ) : (
                owners.map((owner) => (
                  <div
                    key={owner.idnaghsh}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-semibold">
                          {owner.nameuser || "نامشخص"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {owner.phone || "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            از {owner.datestart}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => goToHistory(owner.iduser)}
                        >
                          <Clock className="h-4 w-4" />
                          سوابق
                        </Button>
                      </div>
                    </div>

                    {isManager && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => openEditOwnerPhone(owner)}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          ویرایش شماره
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => openEditOwnerDate(owner)}
                        >
                          <CalendarDays className="h-3.5 w-3.5" />
                          ویرایش تاریخ
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                          onClick={() => openDeleteDialog(owner)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          پایان مالکیت
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isManager && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => openAddDialog('malek')}
                >
                  <Plus className="h-4 w-4" />
                  افزودن مالک
                </Button>
              )}
            </TabsContent>

            {/* ============================================
                Tenants Tab
                ============================================ */}
            <TabsContent value="tenants" className="mt-4 space-y-4">
              {isLoadingPeople ? (
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : peopleError ? (
                <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{peopleError}</AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-auto"
                    onClick={() => void loadPeople()}
                  >
                    تلاش مجدد
                  </Button>
                </Alert>
              ) : tenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    ساکنی برای این واحد ثبت نشده است.
                  </p>
                </div>
              ) : (
                tenants.map((tenant) => (
                  <div
                    key={tenant.idnaghsh}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-semibold">
                          {tenant.nameuser || "نامشخص"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {tenant.phone || "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            از {tenant.datestart}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {tenant.count || "0"} نفر
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => goToHistory(tenant.iduser)}
                        >
                          <Clock className="h-4 w-4" />
                          سوابق
                        </Button>
                      </div>
                    </div>

                    {isManager && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => openEditTenantPhone(tenant)}
                        >
                          <Phone className="h-3.5 w-3.5" />
                          ویرایش شماره
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => openEditTenantDate(tenant)}
                        >
                          <CalendarDays className="h-3.5 w-3.5" />
                          ویرایش تاریخ
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => openEditTenantCount(tenant)}
                        >
                          <UserRound className="h-3.5 w-3.5" />
                          ویرایش نفرات
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                          onClick={() => openDeleteDialog(tenant)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          پایان سکونت
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isManager && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => openAddDialog('saken')}
                >
                  <Plus className="h-4 w-4" />
                  افزودن ساکن
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ============================================
          History Section - سوابق
          ============================================ */}
      {(ownerHistory.length > 0 || tenantHistory.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              سوابق سکونت
            </CardTitle>
            <CardDescription>
              سوابق سکونت مالک و ساکنان این واحد
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingHistory ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                {/* سوابق مالک */}
                {ownerHistory.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                      سوابق مالک
                    </h4>
                    <div className="space-y-2">
                      {ownerHistory.map((item) => (
                        <div
                          key={item.idnaghsh}
                          className="rounded-lg border p-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {item.nameuser || "مالک"}
                            </span>
                            <Badge
                              variant={item.status === 'active' ? 'default' : 'secondary'}
                              className={item.status === 'active' ? 'bg-success' : ''}
                            >
                              {item.status === 'active' ? 'فعال' : 'پایان یافته'}
                            </Badge>
                          </div>
                          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                            <span>از {item.datestart}</span>
                            <span>تا {item.endDate || "تا کنون"}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            تعداد نفرات: {item.count}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 gap-1.5 text-xs"
                            onClick={() => goToHistory(item.iduser)}
                          >
                            <Eye className="h-3 w-3" />
                            مشاهده جزئیات
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* سوابق ساکن */}
                {tenantHistory.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                      سوابق ساکن
                    </h4>
                    <div className="space-y-2">
                      {tenantHistory.map((item) => (
                        <div
                          key={item.idnaghsh}
                          className="rounded-lg border p-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {item.nameuser || "ساکن"}
                            </span>
                            <Badge
                              variant={item.status === 'active' ? 'default' : 'secondary'}
                              className={item.status === 'active' ? 'bg-success' : ''}
                            >
                              {item.status === 'active' ? 'فعال' : 'پایان یافته'}
                            </Badge>
                          </div>
                          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                            <span>از {item.datestart}</span>
                            <span>تا {item.endDate || "تا کنون"}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            تعداد نفرات: {item.count}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 gap-1.5 text-xs"
                            onClick={() => goToHistory(item.iduser)}
                          >
                            <Eye className="h-3 w-3" />
                            مشاهده جزئیات
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ============================================
          Delete Dialog
          ============================================ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteItem?.naghsh === 'malek' ? 'پایان مالکیت' : 'پایان سکونت'}
            </DialogTitle>
            <DialogDescription>
              آیا از پایان دوره این فرد اطمینان دارید؟
              <br />
              تاریخ پایان را وارد کنید.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deleteDate">تاریخ پایان (شمسی)</Label>
              <Input
                id="deleteDate"
                dir="ltr"
                placeholder="مثال: 1404/01/15"
                value={deleteDate}
                onChange={(e) => {
                  setDeleteDate(e.target.value);
                  setDeleteError(null);
                }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                فرمت: سال/ماه/روز (مثال: 1404/01/15)
              </p>
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
            </div>

            {deleteItem && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p>
                  <span className="font-medium">نام:</span>{" "}
                  {deleteItem.nameuser || "نامشخص"}
                </p>
                <p>
                  <span className="font-medium">نقش:</span>{" "}
                  {deleteItem.naghsh === 'malek' ? 'مالک' : 'ساکن'}
                </p>
                <p>
                  <span className="font-medium">شماره:</span>{" "}
                  {deleteItem.phone || "—"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteItem(null);
                setDeleteDate("");
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeletePerson()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  در حال پردازش...
                </>
              ) : (
                "پایان دوره"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================
          Edit Tenant Dialog
          ============================================ */}
      <Dialog
        open={editTenantDialog.type !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditTenantDialog({
              type: null,
              tenant: null,
              phone: "",
              date: "",
              count: "",
            });
            setEditTenantError(null);
            setEditTenantSuccess(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTenantDialog.type === 'phone' && 'ویرایش شماره موبایل'}
              {editTenantDialog.type === 'date' && 'ویرایش تاریخ شروع سکونت'}
              {editTenantDialog.type === 'count' && 'ویرایش تعداد نفرات'}
            </DialogTitle>
            <DialogDescription>
              {editTenantDialog.tenant?.nameuser || 'ساکن'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editTenantDialog.type === 'phone' && (
              <div className="space-y-2">
                <Label htmlFor="editPhone">شماره موبایل</Label>
                <Input
                  id="editPhone"
                  dir="ltr"
                  type="tel"
                  maxLength={11}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  value={editTenantDialog.phone}
                  onChange={(e) => {
                    setEditTenantDialog((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, ""),
                    }));
                    setEditTenantError(null);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  شماره را با ۰ شروع کنید (۱۱ رقم)
                </p>
              </div>
            )}

            {editTenantDialog.type === 'date' && (
              <div className="space-y-2">
                <Label htmlFor="editDate">تاریخ شروع سکونت (شمسی)</Label>
                <Input
                  id="editDate"
                  dir="ltr"
                  placeholder="مثال: 1404/01/01"
                  value={editTenantDialog.date}
                  onChange={(e) => {
                    setEditTenantDialog((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }));
                    setEditTenantError(null);
                  }}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  فرمت: سال/ماه/روز (مثال: 1404/01/01)
                </p>
              </div>
            )}

            {editTenantDialog.type === 'count' && (
              <div className="space-y-2">
                <Label htmlFor="editCount">تعداد نفرات</Label>
                <Input
                  id="editCount"
                  dir="ltr"
                  type="number"
                  max={99}
                  placeholder="مثال: ۲"
                  value={editTenantDialog.count}
                  onChange={(e) => {
                    setEditTenantDialog((prev) => ({
                      ...prev,
                      count: e.target.value.replace(/\D/g, ""),
                    }));
                    setEditTenantError(null);
                  }}
                />
              </div>
            )}

            {editTenantError && (
              <p className="text-sm text-destructive">{editTenantError}</p>
            )}

            {editTenantSuccess && (
              <p className="text-sm text-success">✓ ویرایش با موفقیت انجام شد.</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditTenantDialog({
                  type: null,
                  tenant: null,
                  phone: "",
                  date: "",
                  count: "",
                });
                setEditTenantError(null);
                setEditTenantSuccess(false);
              }}
              disabled={isEditingTenant}
            >
              انصراف
            </Button>
            <Button
              onClick={() => void handleEditTenant()}
              disabled={isEditingTenant || editTenantSuccess}
            >
              {isEditingTenant ? (
                <>
                  <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  در حال ذخیره...
                </>
              ) : editTenantSuccess ? (
                <>
                  <CheckCircle className="ml-2 h-4 w-4" />
                  انجام شد
                </>
              ) : (
                "ذخیره"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================
          Edit Owner Dialog
          ============================================ */}
      <Dialog
        open={editOwnerDialog.type !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditOwnerDialog({
              type: null,
              owner: null,
              phone: "",
              date: "",
            });
            setEditOwnerError(null);
            setEditOwnerSuccess(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editOwnerDialog.type === 'phone' && 'ویرایش شماره موبایل مالک'}
              {editOwnerDialog.type === 'date' && 'ویرایش تاریخ شروع مالکیت'}
            </DialogTitle>
            <DialogDescription>
              {editOwnerDialog.owner?.nameuser || 'مالک'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editOwnerDialog.type === 'phone' && (
              <div className="space-y-2">
                <Label htmlFor="editOwnerPhone">شماره موبایل</Label>
                <Input
                  id="editOwnerPhone"
                  dir="ltr"
                  type="tel"
                  maxLength={11}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  value={editOwnerDialog.phone}
                  onChange={(e) => {
                    setEditOwnerDialog((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, ""),
                    }));
                    setEditOwnerError(null);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  شماره را با ۰ شروع کنید (۱۱ رقم)
                </p>
              </div>
            )}

            {editOwnerDialog.type === 'date' && (
              <div className="space-y-2">
                <Label htmlFor="editOwnerDate">تاریخ شروع مالکیت (شمسی)</Label>
                <Input
                  id="editOwnerDate"
                  dir="ltr"
                  placeholder="مثال: 1404/01/01"
                  value={editOwnerDialog.date}
                  onChange={(e) => {
                    setEditOwnerDialog((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }));
                    setEditOwnerError(null);
                  }}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  فرمت: سال/ماه/روز (مثال: 1404/01/01)
                </p>
              </div>
            )}

            {editOwnerError && (
              <p className="text-sm text-destructive">{editOwnerError}</p>
            )}

            {editOwnerSuccess && (
              <p className="text-sm text-success">✓ ویرایش با موفقیت انجام شد.</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditOwnerDialog({
                  type: null,
                  owner: null,
                  phone: "",
                  date: "",
                });
                setEditOwnerError(null);
                setEditOwnerSuccess(false);
              }}
              disabled={isEditingOwner}
            >
              انصراف
            </Button>
            <Button
              onClick={() => void handleEditOwner()}
              disabled={isEditingOwner || editOwnerSuccess}
            >
              {isEditingOwner ? (
                <>
                  <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  در حال ذخیره...
                </>
              ) : editOwnerSuccess ? (
                <>
                  <CheckCircle className="ml-2 h-4 w-4" />
                  انجام شد
                </>
              ) : (
                "ذخیره"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================
          Add Person Dialog
          ============================================ */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              افزودن {addPersonType === 'malek' ? 'مالک' : 'ساکن'} جدید
            </DialogTitle>
            <DialogDescription>
              اطلاعات فرد را وارد کنید.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="addPhone">شماره موبایل</Label>
              <Input
                id="addPhone"
                dir="ltr"
                type="tel"
                maxLength={11}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={addPhone}
                onChange={(e) => {
                  setAddPhone(e.target.value.replace(/\D/g, ""));
                  setAddError(null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                شماره را با ۰ شروع کنید (۱۱ رقم)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addDate">تاریخ شروع (شمسی)</Label>
              <Input
                id="addDate"
                dir="ltr"
                placeholder="مثال: 1404/01/01"
                value={addDate}
                onChange={(e) => {
                  setAddDate(e.target.value);
                  setAddError(null);
                }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                فرمت: سال/ماه/روز (مثال: 1404/01/01)
              </p>
            </div>

            {addPersonType === 'saken' && (
              <div className="space-y-2">
                <Label htmlFor="addCount">تعداد نفرات</Label>
                <Input
                  id="addCount"
                  dir="ltr"
                  type="number"
                  max={99}
                  placeholder="مثال: ۲"
                  value={addCount}
                  onChange={(e) => {
                    setAddCount(e.target.value.replace(/\D/g, ""));
                    setAddError(null);
                  }}
                />
              </div>
            )}

            {addError && (
              <p className="text-sm text-destructive">{addError}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setAddPhone("");
                setAddDate("");
                setAddCount("");
                setAddError(null);
              }}
              disabled={isAdding}
            >
              انصراف
            </Button>
            <Button
              onClick={() => void handleAddPerson()}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  در حال افزودن...
                </>
              ) : (
                "افزودن"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}