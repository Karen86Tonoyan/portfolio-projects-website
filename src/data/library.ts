export const LIBRARY_CATEGORIES = ['IT', 'Psychologia', 'LLM', 'Raporty'] as const;
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: LibraryCategory;
  description: string;
  /** URL of the PDF file (hosted asset). */
  pdfUrl: string;
}

/** Books are added here when Karen sends new PDF files. */
export const libraryBooks: LibraryBook[] = [];
