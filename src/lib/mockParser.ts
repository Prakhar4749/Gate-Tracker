export interface ParsedMockResult {
  test_name: string;
  test_series: string;
  total_marks: number;
  scored_marks: number;
  total_questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  time_taken_minutes: number;
  subject_scores: Record<string, number>;
}

export function parseMockText(text: string): ParsedMockResult {
  const result: ParsedMockResult = {
    test_name: 'Imported Mock Test',
    test_series: 'Custom',
    total_marks: 100,
    scored_marks: 0,
    total_questions: 65,
    attempted: 0,
    correct: 0,
    wrong: 0,
    time_taken_minutes: 180,
    subject_scores: {}
  };

  // Detect Series
  if (/testbook/i.test(text)) result.test_series = 'Testbook';
  else if (/made\s*easy/i.test(text)) result.test_series = 'Made Easy';
  else if (/gate\s*academy/i.test(text)) result.test_series = 'GATE Academy';

  // Extract Scores
  const scoreMatch = text.match(/(?:score|marks|obtained)[:\s]*(\d+(?:\.\d+)?)/i);
  if (scoreMatch) result.scored_marks = parseFloat(scoreMatch[1]);

  const totalMarksMatch = text.match(/(?:\/|out\s*of)[:\s]*(\d+)/i);
  if (totalMarksMatch) result.total_marks = parseInt(totalMarksMatch[1]);

  // Questions
  const attemptedMatch = text.match(/attempted[:\s]*(\d+)/i);
  if (attemptedMatch) result.attempted = parseInt(attemptedMatch[1]);

  const correctMatch = text.match(/correct[:\s]*(\d+)/i);
  if (correctMatch) result.correct = parseInt(correctMatch[1]);

  const wrongMatch = text.match(/wrong|incorrect[:\s]*(\d+)/i);
  if (wrongMatch) result.wrong = parseInt(wrongMatch[1]);

  // Subject-wise marks (heuristic patterns)
  const lines = text.split('\n');
  const subjects = [
    { name: 'Algorithms', code: 'ALGO' },
    { name: 'Data Structures', code: 'DS' },
    { name: 'Operating Systems', code: 'OS' },
    { name: 'DBMS', code: 'DBMS' },
    { name: 'Computer Networks', code: 'CN' },
    { name: 'TOC', code: 'TOC' },
    { name: 'Compiler', code: 'CD' },
    { name: 'Digital Logic', code: 'DL' },
    { name: 'COA', code: 'COA' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Aptitude', code: 'APT' },
    { name: 'Programming', code: 'PROG' }
  ];

  lines.forEach(line => {
    subjects.forEach(sub => {
      const regex = new RegExp(`${sub.name}[:\\s|]*(\\d+(?:\\.\\d+)?)`, 'i');
      const match = line.match(regex);
      if (match) {
        result.subject_scores[sub.code] = parseFloat(match[1]);
      }
    });
  });

  return result;
}
