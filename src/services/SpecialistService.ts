const baseUrl = 'http://localhost:3333/especialistas'

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud')
  }

  return data
}

export const SpecialistService = {
  getAll(): Promise<any[]> {
    return fetchJson(`${baseUrl}`)
  },

  getInactivos(): Promise<any[]> {
    return fetchJson(`${baseUrl}/inactivos`)
  },

  getOne(id: number): Promise<any> {
    return fetchJson(`${baseUrl}/${id}`)
  },

  create(payload: any): Promise<any> {
    return fetchJson(baseUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(id: number, payload: any): Promise<any> {
    return fetchJson(`${baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  inactivar(id: number): Promise<any> {
    return fetchJson(`${baseUrl}/${id}`, {
      method: 'DELETE',
    })
  },

  restaurar(id: number): Promise<any> {
    return fetchJson(`${baseUrl}/${id}/restore`, {
      method: 'POST',
    })
  },

  eliminarDefinitivamente(id: number): Promise<any> {
    return fetchJson(`${baseUrl}/${id}/force`, {
      method: 'DELETE',
    })
  },
}
