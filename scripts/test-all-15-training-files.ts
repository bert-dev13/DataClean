import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { parseExcelOrCsvFile } from '../src/lib/parser/excelParser';
import { detectDataset } from '../src/lib/detector/templateDetector';
import { ALL_DATASETS } from '../src/lib/templates';
import { validateDataset, applyAllSafeFixes } from '../src/lib/validator/validationEngine';
import { calculateQualityReport } from '../src/lib/validator/readinessCalculator';

interface TrainingFileTestResult {
  file: string;
  datasetId: string;
  datasetName: string;
  totalRecords: number;
  initial: {
    valid: number;
    autoFixAvailable: number;
    mustBeFixed: number;
    readiness: number;
  };
  afterAutoFix: {
    valid: number;
    autoFixAvailable: number;
    mustBeFixed: number;
    readiness: number;
  };
}

async function run() {
  const trainingDir = path.resolve(__dirname, '../training-data');
  const files = fs.readdirSync(trainingDir).filter(f => f.endsWith('.xlsx'));

  console.log(`Found ${files.length} training demo files in ${trainingDir}\n`);

  const results: TrainingFileTestResult[] = [];

  for (const file of files) {
    const filePath = path.join(trainingDir, file);
    const buffer = fs.readFileSync(filePath);
    const fileObj = new File([buffer], file);
    const parsed = await parseExcelOrCsvFile(fileObj);
    const detection = detectDataset(parsed.headers, file);

    if (!detection.bestMatch) {
      console.error(`FAILED to detect dataset for ${file}`);
      continue;
    }

    const dataset = detection.bestMatch.dataset;

    // 1. Initial validation
    const initialReport = validateDataset(parsed.rawRows, dataset);
    const initialQuality = calculateQualityReport(
      initialReport.records,
      initialReport.allIssues,
      dataset,
      {
        matchedColumns: detection.bestMatch.matchedColumns,
        missingColumns: detection.bestMatch.missingColumns,
        extraColumns: detection.bestMatch.extraColumns,
        templateMatchScore: detection.bestMatch.confidenceScore,
        isOldOrIncompleteTemplate: detection.bestMatch.isOldOrIncompleteTemplate,
      }
    );

    const initialCounts = {
      valid: initialQuality.validRecords,
      autoFixAvailable: initialQuality.autoFixAvailableRecords,
      mustBeFixed: initialQuality.errorRecords,
      readiness: initialQuality.readinessScore,
    };

    // 2. Apply Fix All Automatically
    const fixResult = applyAllSafeFixes(initialReport.records, dataset);
    const postFixQuality = calculateQualityReport(
      fixResult.records,
      fixResult.allIssues,
      dataset,
      {
        matchedColumns: detection.bestMatch.matchedColumns,
        missingColumns: detection.bestMatch.missingColumns,
        extraColumns: detection.bestMatch.extraColumns,
        templateMatchScore: detection.bestMatch.confidenceScore,
        isOldOrIncompleteTemplate: detection.bestMatch.isOldOrIncompleteTemplate,
      }
    );
    const postFixCounts = {
      valid: postFixQuality.validRecords,
      autoFixAvailable: postFixQuality.autoFixAvailableRecords,
      mustBeFixed: postFixQuality.errorRecords,
      readiness: postFixQuality.readinessScore,
    };

    results.push({
      file,
      datasetId: dataset.id,
      datasetName: dataset.name,
      totalRecords: parsed.rawRows.length,
      initial: initialCounts,
      afterAutoFix: postFixCounts,
    });
  }

  console.table(results.map(r => ({
    File: r.file,
    Dataset: r.datasetName,
    Total: r.totalRecords,
    'Init Valid': r.initial.valid,
    'Init AutoFix': r.initial.autoFixAvailable,
    'Init MustFix': r.initial.mustBeFixed,
    'Init Score': `${r.initial.readiness}%`,
    'Post Valid': r.afterAutoFix.valid,
    'Post MustFix': r.afterAutoFix.mustBeFixed,
    'Post Score': `${r.afterAutoFix.readiness}%`,
  })));
}

run().catch(console.error);
