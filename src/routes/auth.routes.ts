import { Router } from 'express';
import { AuthController } from '@controllers/AuthController';
import { 
  authenticate, 
  verifyRefreshToken 
} from '@middleware/auth.middleware';
import { validate } from '@middleware/validation.middleware';
import { rateLimitStrict } from '@middleware/rateLimit.middleware';
import { 
  loginValidator, 
  registerValidator, 
  refreshTokenValidator,
  loginDocumentoValidator, 
  loginDocumentoSeguroValidator,
  verificarDocumentoValidator 
} from '@validators/auth.validator';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post(
  '/login',
  rateLimitStrict,
  validate(loginValidator),
  authController.login
);

/**
 * @route   POST /api/auth/login-documento
 * @desc    Login por documento de identidad
 * @access  Public
 */
router.post(
  '/login/documento',
  rateLimitStrict,
  validate(loginDocumentoValidator),
  authController.loginPorDocumento
);

/**
 * @route   POST /api/auth/login/documento-seguro
 * @desc    Iniciar sesión con documento + código de validación
 * @access  Public
 */
router.post(
  '/login/documento-seguro',
  rateLimitStrict,
  validate(loginDocumentoSeguroValidator),
  authController.loginPorDocumentoSeguro
);

/**
 * @route   POST /api/auth/verificar-documento
 * @desc    Verificar si un documento está registrado
 * @access  Public
 */
router.post(
  '/verificar-documento',
  rateLimitStrict,
  validate(verificarDocumentoValidator),
  authController.verificarDocumento
);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
  '/register',
  rateLimitStrict,
  validate(registerValidator),
  authController.register
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar token de acceso
 * @access  Public
 */
router.post(
  '/refresh',
  validate(refreshTokenValidator),
  verifyRefreshToken,
  authController.refreshToken
);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  authController.getMe
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (revocar refresh token)
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  authController.changePassword
);

export default router;