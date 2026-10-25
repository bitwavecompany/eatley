<script setup lang="ts">
import Esp32DiagnosticsCard from '@/components/admin/Esp32DiagnosticsCard.vue'
import ServoCalibrationForm from '@/components/admin/ServoCalibrationForm.vue'
import OperationalRulesForm from '@/components/admin/OperationalRulesForm.vue'
</script>

<template>
  <div class="space-y-6 pb-20 sm:pb-12">
    <div>
      <h2 class="text-2xl font-extrabold tracking-tight text-white">Mantenimiento y Calibración</h2>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">
        Ajustes mecánicos del servomotor MG996R, parámetros del microcontrolador ESP32 y reglas de contingencia.
      </p>
    </div>

    <!-- 1. Live ESP32 Hardware Diagnostics -->
    <Esp32DiagnosticsCard />

    <!-- 2. Mechanical Servo Calibration Form -->
    <ServoCalibrationForm />

    <!-- 3. Operational Rules and Contingencies -->
    <OperationalRulesForm />
  </div>
</template>
