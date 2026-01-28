const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

class ProductCategoryController {
    // GET /product-categories/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("product-categories", {title: "Product Categories"});
    }


    // GET /product-categories/load
    static async loadCategories(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const sql =`
            SELECT * FROM master_product_category
            ORDER BY mpc_id DESC`;

            const result = await mysql.Query(sql);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "CATEGORIES_LISTED",
                "master_product_category",
                null
            );

            res.status(200).json({
                message: "Success",
                data: result
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "CATEGORY_LIST_FAILED",
                    "master_product_category",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("ProductCategoryController.loadCategories: ", error);
            res.status(500).json({
                message: "Error fetching categories",
                data: error
            });
        }
    }


    // POST /product-categories/insert
    static async createCategory(req, res) {
        try {
            
            if(!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { name, description, status } = req.body;

            // VALIDATION
            if (!name) {
                return res.status(400).json({
                    message: "name required",
                    validStatus: ["ACTIVE", "INACTIVE"]
                });
            }

            const sql =`
            INSERT INTO master_product_category
                (mpc_name,
                mpc_description,
                mpc_status)
            VALUES (?, ?, ?)`;

            const result = await mysql.Query(sql, [name, description || null, status || "ACTIVE"]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "CATEGORY_CREATED",
                "master_product_category",
                result.insertId,
                null,
                JSON.stringify({
                    name,
                    description,
                    status: status || "ACTIVE"
                })
            );

            res.status(201).json({
                message: "Category created successfully",
                data: {
                    id: result.insertId,
                    name,
                    status: status || "ACTIVE"
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "CATEGORY_CREATE_FAILED",
                    "master_product_category",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated category name",
                    data: error
                });
            }
            console.error("ProductCategoryController.createCategory: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /product-categories/update
    static async updateCategory(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id, name, description, status } = req.body;

            // VALIDATION
            if (!id || !name) {
                return res.status(400).json({
                    message: "id, name required"
                });
            }

            const sql =`
            UPDATE master_product_category
            SET
                mpc_name = ?,
                mpc_description = ?,
                mpc_status = ?
            WHERE mpc_id = ?`;

            const result = await mysql.Query(sql, [name, description || null, status || "ACTIVE", id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "CATEGORY_UPDATED",
                "master_product_category",
                id
            );

            res.status(200).json({
                message: "Category updated successfully",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "CATEGORY_UPDATE_FAILED",
                    "master_product_category",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated category name",
                    data: error
                });
            }
            console.error("ProductCategoryController.updateCategory: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }

    // PUT /product-categories/delete
    static async deleteCategory(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id } = req.body;

            // VALIDATION
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    message: "Valid ID required"
                });
            }

            const sql =`
            UPDATE master_product_category
            SET
                mpc_status = 'INACTIVE'
            WHERE mpc_id = ?`;

            const result = await mysql.Query(sql, [id]);

            if(result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Category not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "CATEGORY_DELETED",
                "master_product_category",
                id,
                null,
                JSON.stringify({
                    id
                })
            );

            res.status(200).json({
                message: "Category has been soft-deleted",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "CATEGORY_DELETE_FAILED",
                    "master_product_category",
                    id,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("ProductCategoryController.deleteCategory: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }

}

module.exports = ProductCategoryController; 