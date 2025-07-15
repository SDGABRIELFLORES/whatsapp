import * as xlsx from "xlsx";
import { InsertContact } from "@shared/schema";

export interface ExcelContact {
  nome: string;
  numero: string;
  email?: string;
  [key: string]: any;
}

export class ExcelService {
  parseExcelFile(buffer: Buffer): ExcelContact[] {
    try {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header normalization
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error("Planilha vazia");
      }
      
      const headers = jsonData[0] as string[];
      const normalizedHeaders = headers.map(header => 
        header.toLowerCase().trim().replace(/\s+/g, "_")
      );
      
      // Find required columns
      const nameIndex = normalizedHeaders.findIndex(h => 
        h.includes("nome") || h.includes("name")
      );
      const phoneIndex = normalizedHeaders.findIndex(h => 
        h.includes("numero") || h.includes("telefone") || h.includes("phone")
      );
      const emailIndex = normalizedHeaders.findIndex(h => 
        h.includes("email") || h.includes("e-mail")
      );
      
      if (nameIndex === -1 || phoneIndex === -1) {
        throw new Error("Planilha deve conter colunas 'nome' e 'numero'");
      }
      
      const contacts: ExcelContact[] = [];
      
      // Process data rows
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        
        if (row[nameIndex] && row[phoneIndex]) {
          const contact: ExcelContact = {
            nome: String(row[nameIndex]).trim(),
            numero: this.formatPhone(String(row[phoneIndex]).trim()),
          };
          
          if (emailIndex !== -1 && row[emailIndex]) {
            contact.email = String(row[emailIndex]).trim();
          }
          
          // Add custom fields
          headers.forEach((header, index) => {
            if (index !== nameIndex && index !== phoneIndex && index !== emailIndex) {
              const key = header.toLowerCase().trim();
              if (row[index]) {
                contact[key] = String(row[index]).trim();
              }
            }
          });
          
          contacts.push(contact);
        }
      }
      
      return contacts;
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      throw new Error("Erro ao processar planilha: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    }
  }

  formatPhone(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "");
    
    // Add country code if missing
    if (cleaned.length === 10 || cleaned.length === 11) {
      return "55" + cleaned;
    }
    
    if (cleaned.length === 12 || cleaned.length === 13) {
      return cleaned;
    }
    
    return cleaned;
  }

  convertToContacts(excelContacts: ExcelContact[], userId: string, campaignId?: number): InsertContact[] {
    return excelContacts.map(contact => {
      const customData: Record<string, any> = {};
      
      // Extract custom fields
      Object.keys(contact).forEach(key => {
        if (key !== "nome" && key !== "numero" && key !== "email") {
          customData[key] = contact[key];
        }
      });
      
      return {
        userId,
        campaignId,
        name: contact.nome,
        phone: contact.numero,
        email: contact.email,
        customData: Object.keys(customData).length > 0 ? customData : null,
      };
    });
  }

  validateContacts(contacts: ExcelContact[]): { valid: ExcelContact[]; invalid: ExcelContact[] } {
    const valid: ExcelContact[] = [];
    const invalid: ExcelContact[] = [];
    
    contacts.forEach(contact => {
      if (contact.nome && contact.numero && contact.numero.length >= 10) {
        valid.push(contact);
      } else {
        invalid.push(contact);
      }
    });
    
    return { valid, invalid };
  }
}

export const excelService = new ExcelService();
