import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, X, Download } from 'lucide-react';
import { libraryBooks, LIBRARY_CATEGORIES, LibraryBook, LibraryCategory } from '@/data/library';

type Filter = 'Wszystkie' | LibraryCategory;

const Library: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('Wszystkie');
  const [open, setOpen] = useState<LibraryBook | null>(null);

  const list = useMemo(
    () => (filter === 'Wszystkie' ? libraryBooks : libraryBooks.filter(b => b.category === filter)),
    [filter],
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Biblioteka</h1>
        <p className="text-muted-foreground mb-8">Książki, publikacje i raporty Karena Tonoyana — czytaj online.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {(['Wszystkie', ...LIBRARY_CATEGORIES] as Filter[]).map(c => (
            <Button key={c} size="sm" variant={filter === c ? 'default' : 'outline'} onClick={() => setFilter(c)}>
              {c}
            </Button>
          ))}
        </div>

        {open && (
          <div className="mb-8 rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between gap-2 p-3 bg-muted">
              <span className="font-medium text-foreground truncate">{open.title}</span>
              <div className="flex gap-2">
                <a href={open.pdfUrl} download><Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button></a>
                <Button size="sm" variant="outline" onClick={() => setOpen(null)} aria-label="Zamknij"><X className="h-4 w-4" /></Button>
              </div>
            </div>
            <iframe src={open.pdfUrl} title={open.title} className="w-full h-[80vh] bg-background" />
          </div>
        )}

        {list.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">W tej kategorii nie ma jeszcze publikacji.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map(b => (
              <Card key={b.id} className="flex flex-col">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">{b.category}</Badge>
                  <CardTitle className="text-lg">{b.title}</CardTitle>
                  <CardDescription>{b.author}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                  <Button className="w-full" onClick={() => { setOpen(b); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <BookOpen className="h-4 w-4 mr-2" />Czytaj
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
