// src/features/building/store/role.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "malek" | "saken" | "modir" | null;

interface RoleState {
  // نقش فعلی کاربر در واحد/ساختمان انتخاب شده
  currentRole: UserRole;
  
  // آیا کاربر در واحد انتخاب شده هم مالک و هم ساکن است؟
  hasBothRoles: boolean;
  
  // شناسه واحدی که نقش برای آن تنظیم شده (برای جلوگیری از خطا)
  roleUnitId: string | null;
  
  // تنظیم نقش فعلی
  setCurrentRole: (role: UserRole) => void;
  
  // بررسی و تنظیم نقش‌ها بر اساس اطلاعات واحد
  setRolesFromUnit: (unit: { idv?: string; malek?: string; saken?: string; idmodir?: string }, userId: string) => void;
  
  // تنظیم نقش بر اساس ساختمان (مدیر)
  setRoleForBuilding: (userId: string) => void;
  
  // پاک کردن نقش‌ها
  clearRoles: () => void;
  
  // بازیابی نقش از حافظه
  restoreRole: () => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      currentRole: null,
      hasBothRoles: false,
      roleUnitId: null,

      setCurrentRole: (role) => {
        console.log("🔄 setCurrentRole called with:", role);
        set({
          currentRole: role,
        });
      },

      setRolesFromUnit: (unit, userId) => {
        console.log("🏢 setRolesFromUnit called with:", { unit, userId });
        
        const isMalek = unit.malek === userId;
        const isSaken = unit.saken === userId;
        const isModir = unit.idmodir === userId;

        // تعیین نقش‌های موجود
        const availableRoles: UserRole[] = [];
        if (isModir) availableRoles.push("modir");
        if (isMalek) availableRoles.push("malek");
        if (isSaken) availableRoles.push("saken");

        console.log("📋 Available roles:", availableRoles);

        // آیا کاربر هم مالک و هم ساکن است؟
        const hasBoth = isMalek && isSaken;

        // انتخاب نقش پیش‌فرض
        let defaultRole: UserRole = null;
        if (availableRoles.length > 0) {
          // اولویت: مدیر > مالک > ساکن
          if (isModir) defaultRole = "modir";
          else if (isMalek) defaultRole = "malek";
          else if (isSaken) defaultRole = "saken";
        }

        // اگر نقش قبلی در لیست نقش‌های موجود نیست، نقش پیش‌فرض رو انتخاب کن
        const currentRole = get().currentRole;
        const isCurrentRoleValid = currentRole && availableRoles.includes(currentRole);

        const newRole = isCurrentRoleValid ? currentRole : defaultRole;
        
        console.log("🎯 Selected role:", newRole);

        set({
          hasBothRoles: hasBoth,
          currentRole: newRole,
          roleUnitId: unit.idv || null,
        });
      },

      setRoleForBuilding: (userId) => {
        console.log("🏗️ setRoleForBuilding called with userId:", userId);
        // وقتی ساختمان انتخاب میشه، نقش مدیر رو تنظیم میکنیم
        set({
          currentRole: "modir",
          hasBothRoles: false,
          roleUnitId: null,
        });
      },

      clearRoles: () => {
        console.log("🧹 clearRoles called");
        set({
          currentRole: null,
          hasBothRoles: false,
          roleUnitId: null,
        });
      },

      restoreRole: () => {
        const state = get();
        console.log("🔄 restoreRole called, current state:", state);
        // اگر roleUnitId وجود داشت ولی currentRole null بود، نیاز به بازیابی داریم
        if (state.roleUnitId && !state.currentRole) {
          // اینجا میتونیم از localStorage یا جای دیگه بازیابی کنیم
          // فعلاً کاری نمیکنیم
        }
      },
    }),
    {
      name: "user-role-storage",
      partialize: (state) => ({
        currentRole: state.currentRole,
        hasBothRoles: state.hasBothRoles,
        roleUnitId: state.roleUnitId,
      }),
      onRehydrateStorage: () => {
        console.log("🔄 Role store rehydrating...");
        return (state, error) => {
          if (error) {
            console.error("❌ Role store rehydration error:", error);
          } else {
            console.log("✅ Role store rehydrated:", state);
          }
        };
      },
    }
  )
);