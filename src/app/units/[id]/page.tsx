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

import { PersianDateInput } from "@/components/ui/persian-date-input";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  getTodayPersian,
  formatEndDate,
  isEndDateActive,
} from "@/src/shared/date/persian";

import {
  unitPeopleApi,
} from "@/src/features/units/api/unit-people.api";

import type {
  Resident,
} from "@/src/features/units/types/unit-detail.types";

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

type EditOwnerDialogType = 'phone' | 'date' | 'endDate' | null;

interface EditOwnerData {
  type: EditOwnerDialogType;
  owner: Resident | null;
  phone: string;
  date: string;
  endDate: string;
}

type EditTenantDialogType = 'phone' | 'date' | 'count' | 'endDate' | null;

interface EditTenantData {
  type: EditTenantDialogType;
  tenant: Resident | null;
  phone: string;
  date: string;
  count: string;
  endDate: string;
}

// ============================================
// Component
// ============================================

export default function UnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params?.id as string;

  // ============================================
  // Store
  // ============================================
  const user = useAppStore((state) => state.user);
  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);

  // ============================================
  // State - Unit Detail
  // ============================================
  const [unitDetail, setUnitDetail] = useState<UnitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // State - People
  // ============================================
  const [allOwners, setAllOwners] = useState<Resident[]>([]);
  const [allTenants, setAllTenants] = useState<Resident[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);
  const [peopleError, setPeopleError] = useState<string | null>(null);

  // ============================================
  // State - Filter (localStorage)
  // ============================================
  const PEOPLE_FILTER_KEY = `units_people_filter_${unitId}`;

  const [peopleFilter, setPeopleFilter] = useState<"active" | "all">(() => {
    if (typeof window === "undefined") return "active";
    const saved = localStorage.getItem(PEOPLE_FILTER_KEY);
    return saved === "all" ? "all" : "active";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!unitId) return;
    localStorage.setItem(PEOPLE_FILTER_KEY, peopleFilter);
  }, [peopleFilter, unitId, PEOPLE_FILTER_KEY]);

  const owners = peopleFilter === "active"
    ? allOwners.filter((p) => isEndDateActive(p.endDate))
    : allOwners;

  const tenants = peopleFilter === "active"
    ? allTenants.filter((p) => isEndDateActive(p.endDate))
    : allTenants;

  // ============================================
  // State - Edit Unit
  // ============================================
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UnitDetail>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ============================================
  // State - Delete Dialog
  // ============================================
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Resident | null>(null);
  const [deleteDate, setDeleteDate] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ============================================
  // State - Add Dialog
  // ============================================
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addPersonType, setAddPersonType] = useState<'malek' | 'saken'>('malek');
  const [addPhone, setAddPhone] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addCount, setAddCount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // ============================================
  // State - Edit Owner Dialog
  // ============================================
  const [editOwnerDialog, setEditOwnerDialog] = useState<EditOwnerData>({
    type: null,
    owner: null,
    phone: "",
    date: "",
    endDate: "",
  });
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [editOwnerError, setEditOwnerError] = useState<string | null>(null);
  const [editOwnerSuccess, setEditOwnerSuccess] = useState(false);

  // ============================================
  // State - Edit Tenant Dialog
  // ============================================
  const [editTenantDialog, setEditTenantDialog] = useState<EditTenantData>({
    type: null,
    tenant: null,
    phone: "",
    date: "",
    count: "",
    endDate: "",
  });
  const [isEditingTenant, setIsEditingTenant] = useState(false);
  const [editTenantError, setEditTenantError] = useState<string | null>(null);
  const [editTenantSuccess, setEditTenantSuccess] = useState(false);

  // ============================================
  // Permissions
  // ============================================
  const isManager = Boolean(
    user?.iduser && selectedBuilding?.idmodir === user.iduser
  );

  const isOwnerOfUnit = Boolean(
    user?.iduser &&
      allOwners.some((o) => o.iduser === user.iduser && isEndDateActive(o.endDate))
  );

  const isResidentOfUnit = Boolean(
    user?.iduser &&
      allTenants.some((t) => t.iduser === user.iduser && isEndDateActive(t.endDate))
  );

  const canViewPeople = isManager || isOwnerOfUnit || isResidentOfUnit;
  const canViewOwners = isManager || isOwnerOfUnit;
  const canViewTenants = isManager || isResidentOfUnit;

  // ============================================
  // Load Unit Detail
  // ============================================
  const loadUnitDetail = useCallback(async () => {
    if (!unitId) return;

    try {
      const result = await unitDetailApi.getOne(unitId);
      setUnitDetail(result);
      setEditData(result);
    } catch (err) {
      console.error("Load unit detail error:", err);
      setError("دریافت اطلاعات واحد با خطا مواجه شد.");
    }
  }, [unitId]);

  // ============================================
  // Load People
  // ============================================
  const loadPeople = useCallback(async () => {
    if (!unitId) return;

    try {
      const result = await unitPeopleApi.getByUnit(unitId, "0");

      const ownersList = result.filter(
        (p): p is Resident & { naghsh: "مالک" } => p.naghsh === "مالک"
      );
      const tenantsList = result.filter(
        (p): p is Resident & { naghsh: "ساکن" } => p.naghsh === "ساکن"
      );

      setAllOwners(ownersList);
      setAllTenants(tenantsList);
    } catch (err) {
      console.error("Load people error:", err);
      setPeopleError("دریافت اطلاعات مالک و ساکن با خطا مواجه شد.");
    }
  }, [unitId]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!unitId) return;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await loadUnitDetail();
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [unitId, loadUnitDetail]);

  useEffect(() => {
    if (!unitId) return;

    const run = async () => {
      setIsLoadingPeople(true);
      setPeopleError(null);

      try {
        await loadPeople();
      } finally {
        setIsLoadingPeople(false);
      }
    };

    void run();
  }, [unitId, loadPeople]);

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
  // Edit Owner
  // ============================================
  const openEditOwnerPhone = (owner: Resident) => {
    setEditOwnerDialog({
      type: 'phone',
      owner,
      phone: owner.phone || "",
      date: owner.datestart || "",
      endDate: owner.endDate || "",
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
      endDate: owner.endDate || "",
    });
    setEditOwnerError(null);
    setEditOwnerSuccess(false);
  };

  const openEditOwnerEndDate = (owner: Resident) => {
    setEditOwnerDialog({
      type: 'endDate',
      owner,
      phone: owner.phone || "",
      date: owner.datestart || "",
      endDate: owner.endDate || "",
    });
    setEditOwnerError(null);
    setEditOwnerSuccess(false);
  };

  const handleEditOwner = async () => {
    const { type, owner, phone, date, endDate } = editOwnerDialog;

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
        result = await unitPeopleApi.editOwnerDate({
          idnaghsh: owner.idnaghsh,
          date: date,
        });
      } else if (type === 'endDate') {
        result = await unitPeopleApi.editPersonEndDate({
          idnaghsh: owner.idnaghsh,
          endDate: endDate,
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
            endDate: "",
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
  // Edit Tenant
  // ============================================
  const openEditTenantPhone = (tenant: Resident) => {
    setEditTenantDialog({
      type: 'phone',
      tenant,
      phone: tenant.phone || "",
      date: tenant.datestart || "",
      count: tenant.count || "",
      endDate: tenant.endDate || "",
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
      endDate: tenant.endDate || "",
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
      endDate: tenant.endDate || "",
    });
    setEditTenantError(null);
    setEditTenantSuccess(false);
  };

  const openEditTenantEndDate = (tenant: Resident) => {
    setEditTenantDialog({
      type: 'endDate',
      tenant,
      phone: tenant.phone || "",
      date: tenant.datestart || "",
      count: tenant.count || "",
      endDate: tenant.endDate || "",
    });
    setEditTenantError(null);
    setEditTenantSuccess(false);
  };

  const handleEditTenant = async () => {
    const { type, tenant, phone, date, count, endDate } = editTenantDialog;

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
          date: date,
        });
      } else if (type === 'endDate') {
        result = await unitPeopleApi.editPersonEndDate({
          idnaghsh: tenant.idnaghsh,
          endDate: endDate,
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
            endDate: "",
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
  // Delete Person
  // ============================================
  const handleDeletePerson = async () => {
    if (!deleteItem) return;

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

    const existingEndDate =
      person.endDate && person.endDate !== "1490/01/01"
        ? person.endDate
        : getTodayPersian();

    setDeleteDate(existingEndDate);
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
  const goToHistory = (userId: string, role: "malek" | "saken") => {
    router.push(`/units/${unitId}/history?userId=${userId}&role=${role}`);
  };

  // ============================================
  // Render: Loading
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

  // ============================================
  // Render
  // ============================================
  return (
    <div dir="rtl" className="space-y-5 px-4 py-5">
      {/* Header */}
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

      {/* Unit Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            مشخصات واحد
          </CardTitle>
          <CardDescription>اطلاعات پایه و امکانات واحد</CardDescription>
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

      {/* Owners & Tenants */}
      {canViewPeople ? (
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
            <Tabs
              defaultValue={canViewOwners ? "owners" : "tenants"}
              className="w-full"
            >
              <TabsList
                className={cn(
                  "grid w-full",
                  canViewOwners && canViewTenants
                    ? "grid-cols-2"
                    : "grid-cols-1"
                )}
              >
                {canViewOwners && (
                  <TabsTrigger value="owners">
                    مالک ({owners.length})
                  </TabsTrigger>
                )}
                {canViewTenants && (
                  <TabsTrigger value="tenants">
                    ساکنان ({tenants.length})
                  </TabsTrigger>
                )}
              </TabsList>

              {/* ============================================
                  Owners Tab
                  ============================================ */}
              {canViewOwners && (
                <TabsContent value="owners" className="mt-4 space-y-3">
                  {/* فیلتر */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl border p-1">
                    <button
                      type="button"
                      onClick={() => setPeopleFilter("active")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition",
                        peopleFilter === "active"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      مالک فعلی
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeopleFilter("all")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition",
                        peopleFilter === "all"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      همه مالکین
                    </button>
                  </div>

                  {/* لیست */}
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
                  ) : owners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <User className="h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        {peopleFilter === "active"
                          ? "مالک فعلی ثبت نشده است."
                          : "مالکی ثبت نشده است."}
                      </p>
                    </div>
                  ) : (
                    owners.map((item, index) => {
                      const isActive = isEndDateActive(item.endDate);

                      return (
                        <div
                          key={`owner-${item.idnaghsh}-${index}`}
                          className="rounded-lg border p-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">
                                {item.phone || "—"}
                              </span>
                            </div>

                            {item.nameuser && item.nameuser.trim() !== "" && (
                              <div className="text-sm text-muted-foreground">
                                {item.nameuser}
                              </div>
                            )}

                            {/* تاریخ شروع + پایان */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                از {item.datestart || "—"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                تا {formatEndDate(item.endDate)}
                              </span>
                            </div>

                            <Badge
                              variant={isActive ? "default" : "secondary"}
                              className={isActive ? "bg-success" : ""}
                            >
                              {isActive ? "فعال" : "پایان یافته"}
                            </Badge>
                          </div>

                          {/* دکمه‌ها */}
                          <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                            

                            {isManager && (
                              <>
                                {isActive ? (
                                  // ═══════ مالک فعال ═══════
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs"
                                      onClick={() => openEditOwnerPhone(item)}
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                      ویرایش شماره
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs"
                                      onClick={() => openEditOwnerDate(item)}
                                    >
                                      <CalendarDays className="h-3.5 w-3.5" />
                                      ویرایش تاریخ شروع
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                                      onClick={() => openDeleteDialog(item)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      پایان مالکیت
                                    </Button>
                                  </>
                                ) : (
                                  // ═══════ مالک پایان یافته ═══════
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 text-xs"
                                    onClick={() => openEditOwnerEndDate(item)}
                                  >
                                    <Clock className="h-3.5 w-3.5" />
                                    ویرایش تاریخ پایان
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {isManager && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => openAddDialog("malek")}
                    >
                      <Plus className="h-4 w-4" />
                      افزودن مالک
                    </Button>
                  )}
                </TabsContent>
              )}

              {/* ============================================
                  Tenants Tab
                  ============================================ */}
              {canViewTenants && (
                <TabsContent value="tenants" className="mt-4 space-y-3">
                  {/* فیلتر */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl border p-1">
                    <button
                      type="button"
                      onClick={() => setPeopleFilter("active")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition",
                        peopleFilter === "active"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      ساکن فعلی
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeopleFilter("all")}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition",
                        peopleFilter === "all"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      همه ساکنین
                    </button>
                  </div>

                  {/* لیست */}
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
                        {peopleFilter === "active"
                          ? "ساکن فعلی ثبت نشده است."
                          : "ساکنی ثبت نشده است."}
                      </p>
                    </div>
                  ) : (
                    tenants.map((item, index) => {
                      const isActive = isEndDateActive(item.endDate);

                      return (
                        <div
                          key={`tenant-${item.idnaghsh}-${index}`}
                          className="rounded-lg border p-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">
                                {item.phone || "—"}
                              </span>
                            </div>

                            {item.nameuser && item.nameuser.trim() !== "" && (
                              <div className="text-sm text-muted-foreground">
                                {item.nameuser}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>تعداد نفرات: {item.count || "0"}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                از {item.datestart || "—"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                تا {formatEndDate(item.endDate)}
                              </span>
                            </div>

                            <Badge
                              variant={isActive ? "default" : "secondary"}
                              className={isActive ? "bg-success" : ""}
                            >
                              {isActive ? "فعال" : "پایان یافته"}
                            </Badge>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() => goToHistory(item.iduser, "saken")}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              مشاهده سوابق
                            </Button>

                            {isManager && (
                              <>
                                {isActive ? (
                                  // ═══════ ساکن فعال ═══════
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs"
                                      onClick={() => openEditTenantPhone(item)}
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                      ویرایش شماره
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs"
                                      onClick={() => openEditTenantDate(item)}
                                    >
                                      <CalendarDays className="h-3.5 w-3.5" />
                                      ویرایش تاریخ شروع
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs"
                                      onClick={() => openEditTenantCount(item)}
                                    >
                                      <UserRound className="h-3.5 w-3.5" />
                                      ویرایش نفرات
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs border-destructive/50 text-destructive hover:bg-destructive/10"
                                      onClick={() => openDeleteDialog(item)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      پایان سکونت
                                    </Button>
                                  </>
                                ) : (
                                  // ═══════ ساکن پایان یافته ═══════
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 text-xs"
                                    onClick={() => openEditTenantEndDate(item)}
                                  >
                                    <Clock className="h-3.5 w-3.5" />
                                    ویرایش تاریخ پایان
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {isManager && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => openAddDialog("saken")}
                    >
                      <Plus className="h-4 w-4" />
                      افزودن ساکن
                    </Button>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              اطلاعات مالک و ساکنان این واحد برای شما قابل مشاهده نیست.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteItem?.naghsh === 'مالک' ? 'پایان مالکیت' : 'پایان سکونت'}
            </DialogTitle>
            <DialogDescription>
              آیا از پایان دوره این فرد اطمینان دارید؟
              <br />
              تاریخ پایان را وارد کنید.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <PersianDateInput
                label="تاریخ پایان"
                value={deleteDate}
                onChange={(value) => {
                  setDeleteDate(value);
                  setDeleteError(null);
                }}
                error={deleteError ?? undefined}
                required
              />

              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
            </div>

            {deleteItem && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p>
                  <span className="font-medium">شماره:</span>{" "}
                  {deleteItem.phone || "—"}
                </p>
                {deleteItem.nameuser && deleteItem.nameuser.trim() !== "" && (
                  <p className="mt-1">
                    <span className="font-medium">نام:</span>{" "}
                    {deleteItem.nameuser}
                  </p>
                )}
                <p className="mt-1">
                  <span className="font-medium">نقش:</span>{" "}
                  {deleteItem.naghsh}
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

      {/* Edit Owner Dialog */}
      <Dialog
        open={editOwnerDialog.type !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditOwnerDialog({
              type: null,
              owner: null,
              phone: "",
              date: "",
              endDate: "",
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
              {editOwnerDialog.type === 'endDate' && 'ویرایش تاریخ پایان مالکیت'}
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
              <PersianDateInput
                label="تاریخ شروع مالکیت"
                value={editOwnerDialog.date}
                onChange={(value) => {
                  setEditOwnerDialog((prev) => ({
                    ...prev,
                    date: value,
                  }));
                  setEditOwnerError(null);
                }}
              />
            )}

            {editOwnerDialog.type === 'endDate' && (
              <PersianDateInput
                label="تاریخ پایان مالکیت"
                value={editOwnerDialog.endDate}
                onChange={(value) => {
                  setEditOwnerDialog((prev) => ({
                    ...prev,
                    endDate: value,
                  }));
                  setEditOwnerError(null);
                }}
              />
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
                  endDate: "",
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

      {/* Edit Tenant Dialog */}
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
              endDate: "",
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
              {editTenantDialog.type === 'endDate' && 'ویرایش تاریخ پایان سکونت'}
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
              <PersianDateInput
                label="تاریخ شروع سکونت"
                value={editTenantDialog.date}
                onChange={(value) => {
                  setEditTenantDialog((prev) => ({
                    ...prev,
                    date: value,
                  }));
                  setEditTenantError(null);
                }}
              />
            )}

            {editTenantDialog.type === 'count' && (
              <div className="space-y-4">
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

                <PersianDateInput
                  label="تاریخ شروع با این تعداد نفرات"
                  value={editTenantDialog.date}
                  onChange={(value) => {
                    setEditTenantDialog((prev) => ({
                      ...prev,
                      date: value,
                    }));
                    setEditTenantError(null);
                  }}
                />
              </div>
            )}

            {editTenantDialog.type === 'endDate' && (
              <PersianDateInput
                label="تاریخ پایان سکونت"
                value={editTenantDialog.endDate}
                onChange={(value) => {
                  setEditTenantDialog((prev) => ({
                    ...prev,
                    endDate: value,
                  }));
                  setEditTenantError(null);
                }}
              />
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
                  endDate: "",
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

      {/* Add Person Dialog */}
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
              <PersianDateInput
                label="تاریخ شروع"
                value={addDate}
                onChange={(value) => {
                  setAddDate(value);
                  setAddError(null);
                }}
                required
              />
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