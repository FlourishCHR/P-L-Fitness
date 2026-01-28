const mysql = require('./dbconnect.js');

class SystemLogger {
    static async logAction(userId, ipAddress, userAgent, action,
        table, recordId = null, oldData = null, newData = null,
        status = 'SUCCESS', errorMessage = null) {
            try {
                
                await mysql.Query(`
                    INSERT INTO master_system_log (
                        msl_userId,
                        msl_ipAddress,
                        msl_userAgent,
                        msl_action,
                        msl_table,
                        msl_recordId,
                        msl_oldData,
                        msl_newData,
                        msl_status,
                        msl_errorMessage)
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        userId || null,
                        ipAddress || null,
                        userAgent || null,
                        action,
                        table || null,
                        recordId || null,
                        oldData ? JSON.stringify(oldData) : null,
                        newData ? JSON.stringify(newData) : null,
                        status,
                        errorMessage || null
                    ]
                );

            } catch (error) {
                console.error('System log failed:', error);
            }
        }
}

module.exports = SystemLogger;