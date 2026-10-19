'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkflowClientApp } from '@/components/workflow/WorkflowClientApp';
import { WorkflowStep } from '@/components/common/WorkflowStepper';

function WorkflowPageInner() {
  const searchParams = useSearchParams();
  const rawStep = searchParams.get('step') ? parseInt(searchParams.get('step')!, 10) : 1;
  const initialStep = (rawStep >= 1 && rawStep <= 5 ? rawStep : 1) as WorkflowStep;

  const systemParam = searchParams.get('system');
  const initialSystem = (systemParam === 'ODeSSEE' ? 'ODeSSEE' : 'DBL') as 'DBL' | 'ODeSSEE';
  const defaultDataset = initialSystem === 'DBL' ? 'dbl-business' : 'odessee-household';
  const initialDatasetId = searchParams.get('dataset') || defaultDataset;

  const sampleParam = searchParams.get('sample');
  const initialSample = sampleParam
    ? sampleParam
    : initialStep === 5
    ? 'valid'
    : initialStep === 4
    ? 'issues'
    : null;

  const initialFileLoaded = searchParams.get('file') === 'loaded' || initialStep >= 4;
  const initialOpenPanel = searchParams.get('panel') === 'open' || searchParams.get('drawer') === 'open';

  return (
    <WorkflowClientApp
      key={`${initialStep}-${initialSystem}-${initialDatasetId}-${initialSample}-${initialOpenPanel}`}
      initialStep={initialStep}
      initialSystem={initialSystem}
      initialDatasetId={initialDatasetId}
      initialSample={initialSample}
      initialFileLoaded={initialFileLoaded}
      initialOpenPanel={initialOpenPanel}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <WorkflowPageInner />
    </Suspense>
  );
}
