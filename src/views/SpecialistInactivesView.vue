<template>
  <v-container fluid>
    <v-card class="pa-4 mb-4">
      <v-row class="justify-space-between align-center">
        <v-col cols="auto">
          <h2 class="text-h5 font-weight-bold">Especialistas Inactivos</h2>
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" @click="volverAVistaActivos">
            <v-icon icon="mdi-arrow-left" start />
            Volver
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="pa-4">
      <v-data-table
        :headers="headers"
        :items="especialistas"
        :loading="cargando"
        item-value="id"
        class="elevation-1"
        no-data-text="No hay especialistas inactivos"
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
          <v-btn icon color="green" @click="confirmarRestauracion(item)">
            <v-icon icon="mdi-restore" />
          </v-btn>
          <v-btn icon color="red" @click="confirmarEliminacion(item)">
            <v-icon icon="mdi-delete-forever" />
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialogo confirmar restauración -->
    <v-dialog v-model="dialogoRestaurar" max-width="500">
      <v-card>
        <v-card-title class="text-h6">¿Confirmar restauración?</v-card-title>
        <v-card-text>
          ¿Deseas restaurar al especialista
          <strong>{{ especialistaSeleccionado?.nombreCompleto }}</strong
          >?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="dialogoRestaurar = false">Cancelar</v-btn>
          <v-btn color="green" @click="restaurarEspecialista">Restaurar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogo confirmar eliminación definitiva -->
    <v-dialog v-model="dialogoEliminar" max-width="500">
      <v-card>
        <v-card-title class="text-h6">¿Eliminar permanentemente?</v-card-title>
        <v-card-text>
          Esta acción eliminará al especialista
          <strong>{{ especialistaSeleccionado?.nombreCompleto }}</strong> de forma permanente.
          ¿Deseas continuar?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="dialogoEliminar = false">Cancelar</v-btn>
          <v-btn color="red" @click="eliminarDefinitivamente">Eliminar</v-btn>
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
import { useRouter } from 'vue-router'
import { SpecialistService } from '@/services/SpecialistService'

const router = useRouter()

const especialistas = ref<any[]>([])
const cargando = ref(false)
const especialistaSeleccionado = ref<any>(null)
const dialogoRestaurar = ref(false)
const dialogoEliminar = ref(false)

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

function volverAVistaActivos() {
  router.push('/')
}

async function cargarEspecialistasInactivos() {
  cargando.value = true
  try {
    especialistas.value = await SpecialistService.getInactivos()
  } catch (error) {
    mostrarSnackbar('Error al cargar inactivos', 'red')
  } finally {
    cargando.value = false
  }
}

function confirmarRestauracion(item: any) {
  especialistaSeleccionado.value = item
  dialogoRestaurar.value = true
}

function confirmarEliminacion(item: any) {
  especialistaSeleccionado.value = item
  dialogoEliminar.value = true
}

async function restaurarEspecialista() {
  try {
    await SpecialistService.restaurar(especialistaSeleccionado.value.id)
    mostrarSnackbar('Especialista restaurado', 'success')
    dialogoRestaurar.value = false
    await cargarEspecialistasInactivos()
  } catch (error) {
    mostrarSnackbar('Error al restaurar', 'red')
  }
}

async function eliminarDefinitivamente() {
  try {
    await SpecialistService.eliminarDefinitivamente(especialistaSeleccionado.value.id)
    mostrarSnackbar('Especialista eliminado definitivamente', 'success')
    dialogoEliminar.value = false
    await cargarEspecialistasInactivos()
  } catch (error) {
    mostrarSnackbar('Error al eliminar', 'red')
  }
}

function mostrarSnackbar(mensaje: string, color: string) {
  snackbar.value = { mostrar: true, mensaje, color }
}

onMounted(cargarEspecialistasInactivos)
</script>
