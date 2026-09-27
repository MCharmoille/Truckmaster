import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2';
import { getDbConfig } from './config.js';

export const db = mysql.createConnection(getDbConfig());
