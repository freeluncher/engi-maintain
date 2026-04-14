import ky, { type BeforeErrorHook } from 'ky'

export const apiClient = ky.create({
  prefix: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeError: [
      async (state) => {
        try {
          const error = state.error as import('ky').HTTPError;
          const body = await error.response?.json() as { message?: string };
          if (body?.message) {
            error.message = body.message;
          }
        } catch {
          // Ignore if response is not JSON
        }
        return state.error
      },
    ] as BeforeErrorHook[],
  },
})