<template>
  <v-form @submit.prevent="emitirGuardar" ref="formRef" v-model="formValido">
    <v-text-field
      v-model="form.nombre_completo"
      label="Nombre completo"
      :rules="[(v) => !!v || 'Requerido']"
      required
    />
    <v-text-field
      v-model="form.especialidad"
      label="Especialidad"
      :rules="[(v) => !!v || 'Requerido']"
      required
    />
    <v-text-field
      v-model="form.registro_profesional"
      label="Registro profesional"
      :rules="[(v) => !!v || 'Requerido']"
      required
    />

    <h4 class="mt-4 mb-2 text-subtitle-1 font-weight-medium">Horarios</h4>
    <v-row v-for="(horario, index) in form.horarios" :key="index" class="mb-2">
      <v-col cols="4">
        <v-select
          v-model="horario.dia"
          :items="dias"
          label="Día"
          :rules="[(v) => !!v || 'Obligatorio']"
        />
      </v-col>
      <v-col cols="3">
        <v-text-field v-model="horario.hora_inicio" label="Hora inicio" type="time" />
      </v-col>
      <v-col cols="3">
        <v-text-field v-model="horario.hora_fin" label="Hora fin" type="time" />
      </v-col>
      <v-col cols="2" class="d-flex align-center">
        <v-btn icon @click="eliminarHorario(index)" color="red">
          <v-icon icon="mdi-delete" />
        </v-btn>
      </v-col>
    </v-row>

    <v-btn color="primary" @click="agregarHorario" class="mb-4">
      <v-icon icon="mdi-plus" start />
      Añadir horario
    </v-btn>

    <v-row justify="end" class="mt-4">
      <v-col cols="auto">
        <v-btn text @click="$emit('cancelar')">Cancelar</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn color="success" type="submit">Guardar</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const props = defineProps<{
  modelo?: any
}>()

const emit = defineEmits<{
  (e: 'guardar', datos: any): void
  (e: 'cancelar'): void
  (e: 'error', mensaje: string): void
}>()

const formValido = ref(false)
const formRef = ref()

const form = reactive({
  nombre_completo: '',
  especialidad: '',
  registro_profesional: '',
  horarios: [] as { dia: string; hora_inicio: string; hora_fin: string }[],
})

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function agregarHorario() {
  form.horarios.push({
    dia: '',
    hora_inicio: '',
    hora_fin: '',
  })
}

function eliminarHorario(index: number) {
  form.horarios.splice(index, 1)
}

function emitirGuardar() {
  if (!formValido.value) return

  const errores = validarTraslapes()
  if (errores.length > 0) {
    emit('error', errores.join('\\n'))
    return
  }

  emit('guardar', { ...form })
}

function validarTraslapes() {
  const errores: string[] = []
  const horariosPorDia: Record<string, { inicio: number; fin: number }[]> = {}

  for (const h of form.horarios) {
    if (!h.dia || !h.hora_inicio || !h.hora_fin) continue

    const inicio = parseInt(h.hora_inicio.replace(':', ''))
    const fin = parseInt(h.hora_fin.replace(':', ''))

    if (inicio >= fin) {
      errores.push(`En ${h.dia}: la hora de inicio debe ser menor a la de fin`)
      continue
    }

    horariosPorDia[h.dia] ||= []
    horariosPorDia[h.dia].push({ inicio, fin })
  }

  for (const [dia, horarios] of Object.entries(horariosPorDia)) {
    horarios.sort((a, b) => a.inicio - b.inicio)
    for (let i = 1; i < horarios.length; i++) {
      const anterior = horarios[i - 1]
      const actual = horarios[i]
      if (actual.inicio < anterior.fin) {
        errores.push(
          `Traslape en ${dia}: ${formatearHora(anterior.inicio)}-${formatearHora(anterior.fin)} y ${formatearHora(actual.inicio)}-${formatearHora(actual.fin)}`,
        )
      }
    }
  }

  return errores
}

function formatearHora(valor: number): string {
  const str = valor.toString().padStart(4, '0')
  return `${str.slice(0, 2)}:${str.slice(2)}`
}

watch(
  () => props.modelo,
  (nuevo) => {
    if (nuevo) {
      Object.assign(form, {
        nombre_completo: nuevo.nombreCompleto,
        especialidad: nuevo.especialidad,
        registro_profesional: nuevo.registroProfesional,
        horarios:
          nuevo.horarios?.map((h: any) => ({
            dia: h.dia,
            hora_inicio: h.horaInicio?.slice(0, 5),
            hora_fin: h.horaFin?.slice(0, 5),
          })) ?? [],
      })
    }
  },
  { immediate: true },
)
</script>
