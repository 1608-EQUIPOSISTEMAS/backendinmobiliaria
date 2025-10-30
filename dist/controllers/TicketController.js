"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const TicketService_1 = require("@services/tickets/TicketService");
const AssignmentService_1 = require("@services/tickets/AssignmentService");
const response_util_1 = require("@utils/response.util");
const logger_util_1 = require("@utils/logger.util");
class TicketController {
    constructor() {
        /**
         * Crear nuevo ticket con clasificación automática IA
         * POST /api/tickets
         */
        this.create = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const ticketData = {
                    ...req.body,
                    solicitante_id: userId,
                };
                logger_util_1.logger.info(`🎫 Creando ticket: ${ticketData.titulo}`);
                const result = await this.ticketService.createTicket(ticketData);
                logger_util_1.logger.info(`✅ Ticket creado: ${result.data.codigo}`);
                res.status(201).json((0, response_util_1.successResponse)(result, 'Ticket creado exitosamente'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al crear ticket: ${error.message}`);
                next(error);
            }
        };
        /**
         * Listar tickets con filtros y paginación
         * GET /api/tickets
         */
        this.list = async (req, res, next) => {
            try {
                const filters = {
                    estado_id: req.query.estado_id,
                    prioridad_id: req.query.prioridad_id,
                    categoria_id: req.query.categoria_id,
                    tecnico_asignado_id: req.query.tecnico_asignado_id,
                    area_solicitante_id: req.query.area_solicitante_id,
                    solicitante_id: req.query.solicitante_id,
                    fecha_inicio: req.query.fecha_inicio,
                    fecha_fin: req.query.fecha_fin,
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 25,
                };
                logger_util_1.logger.info('📋 Listando tickets con filtros:', filters);
                const result = await this.ticketService.listTickets(filters);
                res.json((0, response_util_1.successResponse)(result, 'Tickets obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar tickets: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener ticket por ID
         * GET /api/tickets/:id
         */
        this.getById = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                logger_util_1.logger.info(`🔍 Obteniendo ticket ID: ${ticketId}`);
                const ticket = await this.ticketService.getTicketById(ticketId);
                res.json((0, response_util_1.successResponse)(ticket, 'Ticket obtenido'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener ticket: ${error.message}`);
                next(error);
            }
        };
        /**
         * Actualizar ticket
         * PATCH /api/tickets/:id
         */
        this.update = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                const userId = req.user.id;
                const updateData = {
                    ...req.body,
                    updated_by: userId,
                };
                logger_util_1.logger.info(`✏️ Actualizando ticket ID: ${ticketId}`);
                const ticket = await this.ticketService.updateTicket(ticketId, updateData);
                logger_util_1.logger.info(`✅ Ticket actualizado: ${ticketId}`);
                res.json((0, response_util_1.successResponse)(ticket, 'Ticket actualizado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al actualizar ticket: ${error.message}`);
                next(error);
            }
        };
        /**
         * Cambiar estado del ticket
         * PATCH /api/tickets/:id/status
         */
        this.changeStatus = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                const userId = req.user.id;
                const { estado_id } = req.body;
                logger_util_1.logger.info(`🔄 Cambiando estado del ticket ${ticketId} a ${estado_id}`);
                const ticket = await this.ticketService.changeStatus(ticketId, estado_id, userId);
                logger_util_1.logger.info(`✅ Estado cambiado: ${ticketId}`);
                res.json((0, response_util_1.successResponse)(ticket, 'Estado actualizado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al cambiar estado: ${error.message}`);
                next(error);
            }
        };
        /**
         * Asignar técnico al ticket
         * POST /api/tickets/:id/assign
         */
        this.assign = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                const userId = req.user.id;
                const { tecnico_id } = req.body;
                logger_util_1.logger.info(`👤 Asignando ticket ${ticketId} al técnico ${tecnico_id}`);
                const ticket = await this.ticketService.assignTicket(ticketId, tecnico_id, userId);
                logger_util_1.logger.info(`✅ Ticket asignado: ${ticketId}`);
                res.json((0, response_util_1.successResponse)(ticket, 'Ticket asignado exitosamente'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al asignar ticket: ${error.message}`);
                next(error);
            }
        };
        /**
         * Agregar comentario al ticket
         * POST /api/tickets/:id/comments
         */
        this.addComment = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                const userId = req.user.id;
                const commentData = {
                    ...req.body,
                    usuario_id: userId,
                };
                logger_util_1.logger.info(`💬 Agregando comentario al ticket ${ticketId}`);
                const comments = await this.ticketService.addComment(ticketId, commentData);
                logger_util_1.logger.info(`✅ Comentario agregado al ticket ${ticketId}`);
                res.status(201).json((0, response_util_1.successResponse)(comments, 'Comentario agregado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al agregar comentario: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener historial del ticket
         * GET /api/tickets/:id/history
         */
        this.getHistory = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                logger_util_1.logger.info(`📜 Obteniendo historial del ticket ${ticketId}`);
                const history = await this.ticketService.getHistory(ticketId);
                res.json((0, response_util_1.successResponse)(history, 'Historial obtenido'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener historial: ${error.message}`);
                next(error);
            }
        };
        /**
         * Buscar tickets similares
         * GET /api/tickets/:id/similar
         */
        this.findSimilar = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                logger_util_1.logger.info(`🔎 Buscando tickets similares a ${ticketId}`);
                const similar = await this.ticketService.findSimilarTickets(ticketId);
                res.json((0, response_util_1.successResponse)(similar, 'Tickets similares encontrados'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al buscar similares: ${error.message}`);
                next(error);
            }
        };
        /**
         * Eliminar ticket (soft delete)
         * DELETE /api/tickets/:id
         */
        this.delete = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                const userId = req.user.id;
                logger_util_1.logger.info(`🗑️ Eliminando ticket ${ticketId}`);
                await this.ticketService.deleteTicket(ticketId, userId);
                logger_util_1.logger.info(`✅ Ticket eliminado: ${ticketId}`);
                res.json((0, response_util_1.successResponse)(null, 'Ticket eliminado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al eliminar ticket: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener técnicos disponibles para asignación
         * GET /api/tickets/technicians/available
         */
        this.getAvailableTechnicians = async (req, res, next) => {
            try {
                logger_util_1.logger.info('👥 Obteniendo técnicos disponibles');
                const technicians = await this.assignmentService.getAvailableTechnicians();
                res.json((0, response_util_1.successResponse)(technicians, 'Técnicos disponibles'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener técnicos: ${error.message}`);
                next(error);
            }
        };
        // Alias para compatibilidad con rutas
        this.getSimilar = this.findSimilar;
        /**
         * Obtener estadísticas de tickets
         * GET /api/tickets/stats
         */
        this.getStats = async (req, res, next) => {
            try {
                logger_util_1.logger.info('📊 Obteniendo estadísticas de tickets');
                // TODO: Implementar estadísticas de tickets
                const stats = {
                    total: 0,
                    activos: 0,
                    resueltos: 0,
                    cerrados: 0,
                };
                res.json((0, response_util_1.successResponse)(stats, 'Estadísticas obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
                next(error);
            }
        };
        /**
         * Tomar ticket (asignarse a sí mismo)
         * POST /api/tickets/:id/take
         */
        this.takeTicket = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                const userId = req.user.id;
                logger_util_1.logger.info(`👤 Técnico ${userId} tomando ticket ${ticketId}`);
                const ticket = await this.ticketService.assignTicket(ticketId, userId, userId);
                logger_util_1.logger.info(`✅ Ticket ${ticketId} tomado por técnico ${userId}`);
                res.json((0, response_util_1.successResponse)(ticket, 'Ticket asignado exitosamente'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al tomar ticket: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener comentarios del ticket
         * GET /api/tickets/:id/comments
         */
        this.getComments = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                logger_util_1.logger.info(`💬 Obteniendo comentarios del ticket ${ticketId}`);
                const comments = await this.ticketService.addComment(ticketId, {});
                res.json((0, response_util_1.successResponse)(comments, 'Comentarios obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener comentarios: ${error.message}`);
                next(error);
            }
        };
        /**
         * Resolver ticket
         * POST /api/tickets/:id/resolve
         */
        this.resolve = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                const userId = req.user.id;
                const { solucion } = req.body;
                logger_util_1.logger.info(`✅ Resolviendo ticket ${ticketId}`);
                // Estado resuelto (asumiendo estado_id = 5)
                const ticket = await this.ticketService.changeStatus(ticketId, 5, userId);
                logger_util_1.logger.info(`✅ Ticket resuelto: ${ticketId}`);
                res.json((0, response_util_1.successResponse)(ticket, 'Ticket resuelto'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al resolver ticket: ${error.message}`);
                next(error);
            }
        };
        /**
         * Cerrar ticket
         * POST /api/tickets/:id/close
         */
        this.close = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                const userId = req.user.id;
                logger_util_1.logger.info(`🔒 Cerrando ticket ${ticketId}`);
                // Estado cerrado (asumiendo estado_id = 6)
                const ticket = await this.ticketService.changeStatus(ticketId, 6, userId);
                logger_util_1.logger.info(`✅ Ticket cerrado: ${ticketId}`);
                res.json((0, response_util_1.successResponse)(ticket, 'Ticket cerrado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al cerrar ticket: ${error.message}`);
                next(error);
            }
        };
        /**
         * Reabrir ticket
         * POST /api/tickets/:id/reopen
         */
        this.reopen = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.id);
                const userId = req.user.id;
                logger_util_1.logger.info(`🔓 Reabriendo ticket ${ticketId}`);
                // Estado abierto (asumiendo estado_id = 1)
                const ticket = await this.ticketService.changeStatus(ticketId, 1, userId);
                logger_util_1.logger.info(`✅ Ticket reabierto: ${ticketId}`);
                res.json((0, response_util_1.successResponse)(ticket, 'Ticket reabierto'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al reabrir ticket: ${error.message}`);
                next(error);
            }
        };
        this.ticketService = new TicketService_1.TicketService();
        this.assignmentService = new AssignmentService_1.AssignmentService();
    }
}
exports.TicketController = TicketController;
//# sourceMappingURL=TicketController.js.map