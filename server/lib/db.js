import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2';
import { getDbConfig } from './config.js';
import { customConsoleLog } from './logger.js';

export const db = mysql.createPool({
    ...getDbConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

db.on('error', (err) => {
    customConsoleLog(`Erreur pool MySQL : ${err.message}`);
});

export function query(conn, sql, params) {
    return new Promise((resolve, reject) => {
        conn.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

export function withTransaction(work, pool = db) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) return reject(err);

            conn.beginTransaction((beginErr) => {
                if (beginErr) {
                    conn.release();
                    return reject(beginErr);
                }

                Promise.resolve()
                    .then(() => work(conn))
                    .then((result) => {
                        conn.commit((commitErr) => {
                            if (commitErr) {
                                conn.rollback(() => {
                                    conn.release();
                                    reject(commitErr);
                                });
                                return;
                            }
                            conn.release();
                            resolve(result);
                        });
                    })
                    .catch((workErr) => {
                        conn.rollback(() => {
                            conn.release();
                            reject(workErr);
                        });
                    });
            });
        });
    });
}
