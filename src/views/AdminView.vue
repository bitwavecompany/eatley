<script setup lang="ts">
import Esp32DiagnosticsCard from '@/components/admin/Esp32DiagnosticsCard.vue'
import ServoCalibrationForm from '@/components/admin/ServoCalibrationForm.vue'
import OperationalRulesForm from '@/components/admin/OperationalRulesForm.vue'
</script>

<template>
  <div class="space-y-6 pb-20 sm:pb-12">
    <div>
      <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Configuración y Calibración</h2>
    </div>

    <!-- 1. Live ESP32 Hardware Diagnostics -->
    <Esp32DiagnosticsCard />

    <!-- 2. Mechanical Servo Calibration Form -->
    <ServoCalibrationForm />

    <!-- 3. Operational Rules and Contingencies -->
    <OperationalRulesForm />
  </div>
</template>
