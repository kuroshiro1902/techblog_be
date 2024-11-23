import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

interface LogOptions {
  level?: LogLevel;
  filename?: string;
  directory?: string;
}

export class Logger {
  private static defaultOptions: Required<LogOptions> = {
    level: 'INFO',
    filename: '.log',
    directory: 'logs'
  };

  static async log(message: string, options?: LogOptions) {
    const opts = { ...this.defaultOptions, ...options };
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logEntry = `[${timestamp}] [${opts.level}] ${message}\n`;

    try {
      // Ensure directory exists
      const logDir = path.join(process.cwd(), opts.directory);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Write to log file
      const logPath = path.join(logDir, opts.filename);
      await fs.promises.appendFile(logPath, logEntry, 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  static async info(message: string, options?: Omit<LogOptions, 'level'>) {
    await this.log(message, { ...options, level: 'INFO' });
  }

  static async error(message: string, options?: Omit<LogOptions, 'level'>) {
    await this.log(message, { ...options, level: 'ERROR' });
  }

  static async warn(message: string, options?: Omit<LogOptions, 'level'>) {
    await this.log(message, { ...options, level: 'WARN' });
  }

  static async debug(message: string, options?: Omit<LogOptions, 'level'>) {
    await this.log(message, { ...options, level: 'DEBUG' });
  }
}