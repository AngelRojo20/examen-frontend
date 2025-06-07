<template>
  <v-container fluid>
    <v-card class="pa-4 mb-4">
      <v-row class="justify-space-between align-center">
        <v-col cols="auto">
          <h2 class="text-h5 font-weight-bold">Especialistas Activos</h2>
        </v-col>
        <v-col cols="auto" class="d-flex ga-2">
          <v-btn color="primary" v-if="!mostrarFormulario" @click="iniciarCreacion">
            <v-icon icon="mdi-plus" start />
            Crear
          </v-btn>
          <v-btn color="secondary" @click="irAVistaInactivos">
            <v-icon icon="mdi-account-off" start />
            Inactivos
          </v-btn>
        </v-col>
      </v-row>

      <SpecialistForm
        v-if="mostrarFormulario"
        :modelo="especialistaSeleccionado"
        @guardar="confirmarEspecialista"
        @cancelar="cancelarFormulario"
        @error="mostrarError"
      />
    </v-card>

    <v-card class="pa-4">
      <v-data-table
        :headers="headers"
        :items="especialistas"
        :loading="cargando"
        item-value="id"
        class="elevation-1"
        no-data-text="No hay especialistas registrados"
      >
        <template #item.horarios="{ item }">
          <ul class="ma-0 pa-0">
            <li v-for="h in item.horarios" :key="h.id">
              <strong>{{ h.dia }}:</strong> {{ h.horaInicio.slice(0, 5) }} -
              {{ h.horaFin.slice(0, 5) }}
            </li>
          </ul>
        </template>

        <template #item.acciones="{ item }">
          <v-btn icon color="blue" @click="iniciarEdicion(item)">
            <v-icon icon="mdi-pencil" />
          </v-btn>
          <v-btn icon color="red" @click="confirmarEliminacion(item)">
            <v-icon icon="mdi-delete" />
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal de confirmación creación/edición -->
    <v-dialog v-model="dialogoConfirmacion" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          {{ modoFormulario === 'crear' ? '¿Confirmar creación?' : '¿Confirmar edición?' }}
        </v-card-title>
        <v-card-text>
          {{
            modoFormulario === 'crear'
              ? '¿Estás seguro de que deseas guardar este especialista?'
              : '¿Deseas guardar los cambios realizados?'
          }}
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="dialogoConfirmacion = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarEspecialista">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmación eliminación -->
    <v-dialog v-model="dialogoEliminar" max-width="500">
      <v-card>
        <v-card-title class="text-h6">¿Confirmar eliminación?</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar al especialista
          <strong>{{ especialistaAEliminar?.nombreCompleto }}</strong
          >?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="dialogoEliminar = false">Cancelar</v-btn>
          <v-btn color="red" @click="eliminarEspecialista">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.mostrar"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
    >
      {{ snackbar.mensaje }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SpecialistForm from '@/components/SpecialistForm.vue'
import { SpecialistService } from '@/services/SpecialistService'
import { useRouter } from 'vue-router'

const especialistas = ref<any[]>([])
const cargando = ref(false)
const mostrarFormulario = ref(false)
const dialogoConfirmacion = ref(false)
const dialogoEliminar = ref(false)
const datosPendientes = ref<any>(null)
const modoFormulario = ref<'crear' | 'editar'>('crear')
const especialistaSeleccionado = ref<any>(null)
const especialistaAEliminar = ref<any>(null)
const router = useRouter()

const snackbar = ref({
  mostrar: false,
  mensaje: '',
  color: 'success',
})

const headers = [
  { title: 'Nombre', key: 'nombreCompleto' },
  { title: 'Especialidad', key: 'especialidad' },
  { title: 'Registro', key: 'registroProfesional' },
  { title: 'Horarios', key: 'horarios' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

function irAVistaInactivos() {
  router.push('/especialistas/inactivos')
}

async function cargarEspecialistas() {
  cargando.value = true
  try {
    especialistas.value = await SpecialistService.getAll()
  } catch (error) {
    snackbar.value = {
      mostrar: true,
      mensaje: 'Error al cargar especialistas',
      color: 'red',
    }
  } finally {
    cargando.value = false
  }
}

function iniciarCreacion() {
  modoFormulario.value = 'crear'
  especialistaSeleccionado.value = null
  mostrarFormulario.value = true
}

function iniciarEdicion(especialista: any) {
  modoFormulario.value = 'editar'
  especialistaSeleccionado.value = especialista
  mostrarFormulario.value = true
}

function cancelarFormulario() {
  mostrarFormulario.value = false
  especialistaSeleccionado.value = null
  modoFormulario.value = 'crear'
}

function confirmarEspecialista(datos: any) {
  datosPendientes.value = datos
  dialogoConfirmacion.value = true
}

function confirmarEliminacion(especialista: any) {
  especialistaAEliminar.value = especialista
  dialogoEliminar.value = true
}

async function eliminarEspecialista() {
  try {
    await SpecialistService.inactivar(especialistaAEliminar.value.id)
    await cargarEspecialistas()
    dialogoEliminar.value = false
    snackbar.value = {
      mostrar: true,
      mensaje: 'Especialista eliminado correctamente',
      color: 'success',
    }
  } catch (error: any) {
    snackbar.value = {
      mostrar: true,
      mensaje: error?.message || 'Error al eliminar especialista',
      color: 'red',
    }
  }
}

async function guardarEspecialista() {
  try {
    if (modoFormulario.value === 'crear') {
      await SpecialistService.create(datosPendientes.value)
    } else {
      await SpecialistService.update(especialistaSeleccionado.value.id, datosPendientes.value)
    }

    await cargarEspecialistas()
    mostrarFormulario.value = false
    dialogoConfirmacion.value = false

    snackbar.value = {
      mostrar: true,
      mensaje:
        modoFormulario.value === 'crear'
          ? 'Especialista creado exitosamente'
          : 'Especialista actualizado correctamente',
      color: 'success',
    }
  } catch (error: any) {
    snackbar.value = {
      mostrar: true,
      mensaje: error?.message || 'Ocurrió un error al guardar',
      color: 'red',
    }
  }
}

function mostrarError(mensaje: string) {
  snackbar.value = {
    mostrar: true,
    mensaje,
    color: 'red',
  }
}

onMounted(cargarEspecialistas)
</script>
