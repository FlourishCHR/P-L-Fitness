const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

class EquipmentController {
    // GET /equipment/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("equipment", {title: "Equipment"});
    }

    // GET /equipment/load
    static async loadEquipment(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const sql =`
            SELECT
                me_id,
                me_brand,
                me_type,
                me_status,
                me_quantity,
                me_purchasedDate
            FROM master_equipment
            -- WHERE me_status != 'DELETED' -- delete this to see 'DELETED' status
            ORDER BY me_type, me_brand`;

            const result = await mysql.Query(sql);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "EQUIPMENT_LISTED",
                "master_equipment",
                null,
                null,
                null
            );
            
            res.status(200).json({
                message: "Success",
                data: result
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "EQUIPMENT_LIST_FAILED",
                    "master_equipment",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                )
            };
            console.error("EquipmentController.loadEquipment: ", error);
            res.status(500).json({
                message: "Error fetching equipment",
                data: error
            });
        }
    }

    // POST /equipment/insert
    static async createEquipment(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { brand, type, status,
                quantity, purchasedDate } = req.body;

            // VALIDATION
            if(!brand || !type || !quantity) {
                return res.status(400).json({
                    message: "brand, type, quantity required"
                });
            }

            const sql =`
            INSERT INTO master_equipment
                (me_brand,
                me_type,
                me_status,
                me_quantity,
                me_purchasedDate)
            VALUES (?, ?, COALESCE(?, 'AVAILABLE'), ?, ?)`;

            const result = await mysql.Query(sql, [brand, type,
                status, quantity, purchasedDate || null]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "EQUIPMENT_CREATED",
                "master_equipment",
                result.insertId, // new equipment id
                null,           // no old data
                JSON.stringify({
                    brand,
                    type,
                    quantity
                })          // equipment context
            );

            res.status(201).json({
                message: "Equipment created successfully",
                data: {
                    equipmentId: result.insertId,
                    brand,
                    type
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "EQUIPMENT_CREATE_FAILED",
                    "master_equipment",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated Entry",
                    data: error
                });
            }
            console.error("EquipmentController.createEquipment: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }

    // PUT /equipment/update
    static async updateEquipment(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id, brand, type, quantity, status } = req.body;

            // VALIDATION
            if (!id) {
                return res.status(400).json({
                    message: "id required"
                });
            }

            const current = await mysql.Query(`
                SELECT
                    me_brand,
                    me_type,
                    me_status,
                    me_quantity
                FROM master_equipment
                WHERE me_id = ?`, [id]);

            if (!current.length) {
                return res.status(404).json({
                    message: "Equipment not found"
                });
            }

            const sql =`
            UPDATE master_equipment
            SET
                me_brand = ?,
                me_type = ?,
                me_quantity = ?,
                me_status = COALESCE(?, me_status)
            WHERE me_id = ?`;

            const result = await mysql.Query(sql, [brand, type, quantity, status, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Equipment not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "EQUIPMENT_UPDATED",
                "master_equipment",
                id,
                JSON.stringify({
                    brand: current[0].me_brand,
                    type: current[0].me_type,
                    status: current[0].me_status,
                    quantity: current[0].me_quantity
                }), // old data
                JSON.stringify({
                    brand,
                    type,
                    status,
                    quantity
                }) // new data
            );

            res.status(200).json({
                message: "Equipment has been updated",
                affectedRows: result.affectedRows,
                data: result
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "EQUIPMENT_UPDATE_FAILED",
                    "master_equipment",
                    id || null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated Entry",
                    data: error
                });
            }
            console.error("EquipmentController.updateEquipment: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }

    // PUT /equipment/delete
    static async deleteEquipment(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id } = req.body;

            // VALIDATION
            if (!id) {
                return res.status(400).json({
                    message: "id required"
                });
            }

            const current = await mysql.Query(`
                SELECT
                    me_brand,
                    me_type,
                    me_status,
                    me_quantity
                FROM master_equipment
                WHERE me_id = ?`, [id]);

            if (!current.length) {
                return res.status(404).json({
                    message: "Equipment not found"
                });
            }

            const sql =`
            UPDATE master_equipment
            SET me_status = 'DELETED'
            WHERE me_id = ?`;

            const result = await mysql.Query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Equipment not found"
                });
            }


            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "EQUIPMENT_DELETED",
                "master_equipment",
                id,
                JSON.stringify(current[0]), // old data
                null // new data
            )

            res.status(200).json({
                message: "Equipment has been soft deleted",
                affectedRows: result.affectedRows,
                data: result
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "EQUIPMENT_DELETE_FAILED",
                    "master_equipment",
                    id || null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("EquipmentController.deleteEquipment: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }
}

module.exports = EquipmentController;