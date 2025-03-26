import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  ACTION = 'action',
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logsDir = path.join(process.cwd(), 'logs');
  private readonly debugLogPath: string;
  private readonly errorsLogPath: string;
  private readonly actionsLogPath: string;

  constructor() {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    this.debugLogPath = path.join(this.logsDir, 'debug.log');
    this.errorsLogPath = path.join(this.logsDir, 'errors.log');
    this.actionsLogPath = path.join(this.logsDir, 'actions.log');
  }

  log(message: string, context?: string): void {
    this.writeLog(LogLevel.INFO, message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.writeLog(LogLevel.ERROR, message, context, trace);
  }

  warn(message: string, context?: string): void {
    this.writeLog(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: string): void {
    this.writeLog(LogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: string): void {
    this.writeLog(LogLevel.DEBUG, message, context);
  }

  // Custom method for logging user actions
  action(message: string, data?: any): void {
    this.writeLog(LogLevel.ACTION, message, undefined, undefined, data);
  }

  private writeLog(
    level: LogLevel,
    message: string,
    context?: string,
    trace?: string,
    data?: any,
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      trace,
      data,
    };

    const logString = JSON.stringify(logEntry) + '\n';

    try {
      // Write to appropriate log file based on level
      if (level === LogLevel.ERROR) {
        fs.appendFileSync(this.errorsLogPath, logString);
      } else if (level === LogLevel.ACTION) {
        fs.appendFileSync(this.actionsLogPath, logString);
      } else {
        fs.appendFileSync(this.debugLogPath, logString);
      }
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
}
