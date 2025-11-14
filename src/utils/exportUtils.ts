// Utility functions for exporting data to CSV

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from the data
  const headers = Array.from(
    new Set(data.flatMap(obj => Object.keys(obj)))
  );

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Handle different data types
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          if (typeof value === 'string' && value.includes(',')) return `"${value.replace(/"/g, '""')}"`;
          return value;
        })
        .join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCandidatesData(candidates: any[]) {
  const formattedData = candidates.map(c => ({
    Email: c.user_email,
    'WILL Score': c.will_score,
    'SKILL Score': c.skill_score,
    Quadrant: c.quadrant,
    'Recommended Role': c.recommended_role,
    'Review Status': c.review_status,
    Shortlisted: c.is_shortlisted ? 'Yes' : 'No',
    'Submitted At': new Date(c.created_at).toLocaleString(),
    Confidence: `${c.confidence}%`,
  }));

  exportToCSV(formattedData, 'candidates');
}
