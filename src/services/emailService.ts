import { Resend } from 'resend';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/config';

interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export class EmailService {
  private resend: Resend;
  private templateCache: Map<string, HandlebarsTemplateDelegate>;

  constructor() {
    this.resend = new Resend(config.email.resendApiKey);
    this.templateCache = new Map();
  }

  async sendEmail(options: EmailOptions): Promise<string> {
    try {
      let html = options.html;
      let text = options.text;

      // Process template if specified
      if (options.template) {
        const templateResult = await this.processTemplate(options.template, options.context || {});
        html = templateResult.html;
        text = templateResult.text;
      }

      const response = await this.resend.emails.send({
        from: config.email.from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
        //@ts-ignore
        reply_to: options.replyTo,
        subject: options.subject,
        html: html,
        text: text,
        attachments: options.attachments?.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content.toString('base64'),
          path: undefined
        })),
        tags: options.tags
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data.id;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  private async processTemplate(templateName: string, context: Record<string, any>) {
    try {
      let template = this.templateCache.get(templateName);

      if (!template) {
        const templatePath = path.join(process.cwd(), config.email.templateDir, `${templateName}.hbs`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        template = handlebars.compile(templateContent);
        this.templateCache.set(templateName, template);
      }

      const html = template(context);
      const text = html.replace(/<[^>]*>/g, ''); // Simple HTML to text conversion

      return { html, text };
    } catch (error) {
      console.error('Failed to process email template:', error);
      throw new Error('Failed to process email template');
    }
  }
}