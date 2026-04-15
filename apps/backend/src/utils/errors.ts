/**
 * Base application error — selalu lempar turunan kelas ini dari Service layer,
 * supaya Controller bisa menentukan HTTP status code yang tepat.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400 – Data tidak valid / request tidak dapat diproses */
export class BadRequestError extends AppError {
  constructor(message = 'Permintaan tidak valid') {
    super(message, 400);
  }
}

/** 401 – Autentikasi gagal */
export class UnauthorizedError extends AppError {
  constructor(message = 'Autentikasi diperlukan') {
    super(message, 401);
  }
}

/** 403 – Akses ditolak */
export class ForbiddenError extends AppError {
  constructor(message = 'Akses ditolak') {
    super(message, 403);
  }
}

/** 404 – Resource tidak ditemukan */
export class NotFoundError extends AppError {
  constructor(message = 'Resource tidak ditemukan') {
    super(message, 404);
  }
}

/** 409 – Konflik data (misal: duplicate serial number) */
export class ConflictError extends AppError {
  constructor(message = 'Data sudah ada atau terjadi konflik') {
    super(message, 409);
  }
}
