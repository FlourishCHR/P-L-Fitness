const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

class ProductsController {
    // GET /products/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("products", {title: "Products"});
    }

    // TEMPORARY
    // GET /products/load
    // static async loadProducts(req, res) {
    //     try {
            
    //         if(!req.user?.id) {
    //             return res.status(401).json({
    //                 message: "Authentication required (Bearer token)"
    //             });
    //         }

    //         const sql = `
    //         SELECT * FROM master_product
    //         ORDER BY mpr_id DESC`;

    //         const result = await mysql.Query(sql);

    //         // SYSTEM LOGGING - SUCCESS
    //         await SystemLogger.logAction(
    //             req.user.id,
    //             req.ip,
    //             req.get("User-Agent"),
    //             "PRODUCTS_LISTED",
    //             "master_product",
    //             null
    //         );

    //         res.status(200).json({
    //             message: "Success",
    //             data: result
    //         });

    //     } catch (error) {
    //         // SYSTEM LOGGING - ERROR
    //         if (req.user?.id) {
    //             await SystemLogger.logAction(
    //                 req.user.id,
    //                 req.ip,
    //                 req.get("User-Agent"),
    //                 "PRODUCT_LIST_FAILED",
    //                 "master_product",
    //                 null,
    //                 null,
    //                 null,
    //                 "FAILED",
    //                 error.message
    //             );
    //         }
    //         console.error("ProductsController.loadProducts: ", error);
    //         res.status(500).json({
    //             message: "Error fetching products",
    //             data: error
    //         });
    //     }
    // }

    // GET /products/?:categoryId
    static async loadProductsByCategory(req, res) {
        try {
            
            if(!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { categoryId } = req.query;

            // VALIDATION
            if (categoryId) {
                const categoryCheck = await mysql.Query(`
                    SELECT
                        mpc_id,
                        mpc_name
                    FROM master_product_category
                    WHERE mpc_id = ?
                    AND mpc_status = 'ACTIVE'`, [categoryId]);

                if (categoryCheck.length === 0) {
                    return res.status(400).json({
                        message: `Category ${categoryId} not found`,
                        availableCategory: await mysql.Query(`
                            SELECT
                                mpc_id,
                                mpc_name
                            FROM master_product_category
                            WHERE mpc_status = 'ACTIVE'`)
                    });
                }
            }

            let sql=`
            SELECT 
                p.*,
                c.mpc_name AS category_name
            FROM master_product p
            LEFT JOIN master_product_category c ON p.mpr_categoryId = c.mpc_id
            WHERE p.mpr_status = 'ACTIVE'`;

            const params = [];

            if (categoryId) {
                sql += ` AND p.mpr_categoryId = ?`;
                params.push(categoryId);
            }

            sql += ` ORDER BY p.mpr_id DESC`;

            const result = await mysql.Query(sql, params);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "PRODUCTS_LISTED_BY_CATEGORY",
                "master_product",
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
                    "PRODUCT_LIST_FAILED",
                    "master_product",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("ProductsController.loadProductsByCategory: ", error);
            res.status(500).json({
                message: "Error fetching products",
                data: error
            });
        }
    }



    // POST /products/insert
    static async createProduct(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { name, price, stockQuantity, description, status, categoryId, sku } = req.body;

            // VALIDATION
            if (!name || !price || stockQuantity === undefined) {
                return res.status(400).json({
                    message: "name, price, stockQuantity required",
                    validStatus: ["ACTIVE", "INACTIVE"]
                });
            }

            const categoryCheck = await mysql.Query(`
                SELECT mpc_id
                FROM master_product_category
                WHERE mpc_id = ?
                AND mpc_status = 'ACTIVE'`, [categoryId]);
            
            if (categoryCheck.length === 0) {
                return res.status(400).json({
                    message: `Invalid categoryId: ${categoryId}. Create category first.`,
                    availableCategories: await mysql.Query(`
                        SELECT
                            mpc_id,
                            mpc_name
                        FROM master_product_category
                        WHERE mpc_status = 'ACTIVE'`)
                });
            }

            const sql =`
            INSERT INTO master_product
                (mpr_categoryId,
                mpr_sku,
                mpr_name,
                mpr_price,
                mpr_stockQuantity,
                mpr_description,
                mpr_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

            const result = await mysql.Query(sql, [categoryId, `SKU${Date.now()}`, name, parseFloat(price),
                parseInt(stockQuantity), description || null, status || "ACTIVE"]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "PRODUCT_CREATED",
                "master_product",
                result.insertId,
                null,
                JSON.stringify({
                    name,
                    price,
                    stockQuantity,
                    description,
                    status: status || "ACTIVE"
                })
            );

            res.status(201).json({
                message: "Product created successfully",
                data: {
                    id: result.insertId,
                    name,
                    price: parseFloat(price),
                    stockQuantity: parseInt(stockQuantity)                   
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "PRODUCT_CREATE_FAILED",
                    "master_product",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated entry",
                    data: error
                });
            }
            console.error("ProductsController.createProduct: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /products/update
    static async updateProduct(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id, name, price, stockQuantity, description, status } = req.body;

            // VALIDATION
            if (!id || !name || !price) {
                return res.status(400).json({
                    message: "id, name, price required"
                });
            }

            const sql =`
            UPDATE master_product
            SET
                mpr_name = ?,
                mpr_price = ?,
                mpr_stockQuantity = ?,
                mpr_description = ?,
                mpr_status = ?
            WHERE mpr_id = ?`;

            const result = await mysql.Query(sql, [name, parseFloat(price),
                parseInt(stockQuantity), description, status || "ACTIVE", id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "PRODUCT_UPDATED",
                "master_product",
                id
            );

            res.status(200).json({
                message: "Product updated successfully",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "PRODUCT_UPDATE_FAILED",
                    "master_product",
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
            console.error("ProductsController.updateProduct: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /products/delete
    static async deleteProduct(req, res) {
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
            UPDATE master_product
            SET mpr_status = 'INACTIVE'
            WHERE mpr_id = ?`;

            const result = await mysql.Query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "PRODUCT_DELETED",
                "master_product",
                id,
                null,
                JSON.stringify({
                    id
                })
            );

            res.status(200).json({
                message: "Product has been soft-deleted",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "PRODUCT_DELETE_FAILED",
                    "master_product",
                    id,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated entry",
                    data: error
                });
            }
            console.error("ProductsController.deleteProduct: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // POST /products/sale
    static async createProductSale(req, res) {
        try {
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { paymentId, products } = req.body;

            // VALIDATION
            if (!paymentId || !Array.isArray(products) || products.length === 0) {
                return res.status(400).json({
                    message: "paymentId and products array required",
                    example: [{productId: 1, quantity: 2}]
                });
            }

            // VERIFY PAYMENT EXISTS
            const paymentCheck = await mysql.Query(
                `SELECT mp_userId
                FROM master_payment
                WHERE mp_id = ?`,
                [paymentId]
            );
            
            if (paymentCheck.length === 0) {
                return res.status(404).json({
                    message: "Payment not found"
                });
            }

            const userId = paymentCheck[0].mp_userId;
            let salesCreated = 0;

            // CREATE EACH PRODUCT SALE
            for (const item of products) {

                if (!item.productId || !item.quantity || item.quantity <= 0) {
                    continue;
                }

                // VERIFY AND GET PRICE
                const productCheck = await mysql.Query(
                    `SELECT mpr_price
                    FROM master_product
                    WHERE mpr_id = ?
                    AND mpr_status = 'ACTIVE'`,
                    [item.productId]
                );

                if (productCheck.length === 0) {
                    console.log(`Product ${item.productId} not found or inactive`);
                    continue;
                }

                const unitPrice = productCheck[0].mpr_price;

                const result = await mysql.Query(`
                    INSERT INTO master_product_sale 
                        (mps_paymentId,
                        mps_userId,
                        mps_productId,
                        mps_quantity,
                        mps_unitPrice)
                    VALUES (?, ?, ?, ?, ?)
                `, [paymentId, userId, item.productId, item.quantity, unitPrice]);

                if (result.insertId) salesCreated++;
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "PRODUCT_SALE_CREATED",
                "master_product_sale",
                paymentId,
                null,
                JSON.stringify({
                    paymentId,
                    products: products.length,
                    salesCreated,
                    userId
                })
            );

            res.status(201).json({
                message: `${salesCreated}/${products.length} product sales created!`,
                salesCreated,
                totalProducts: products.length
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "PRODUCT_SALE_FAILED",
                    "master_product_sale",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("ProductsController.createProductSale:", error);
            res.status(500).json({
                message: "Server Error (500)",
                error: error.message
            });
        }
    }
}

module.exports = ProductsController;