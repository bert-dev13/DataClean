import { DatasetDefinition } from '../types';

import { businessDefinition } from './dbl/business';
import { crimeDefinition } from './dbl/crime';
import { humanresourceDefinition } from './dbl/human-resource';
import { powerDefinition } from './dbl/power';
import { residentialDefinition } from './dbl/residential';
import { telecommunicationDefinition } from './dbl/telecommunication';
import { transportationDefinition } from './dbl/transportation';
import { waterDefinition } from './dbl/water';

import { barangayhouseholdDefinition } from './odessee/barangay-household';
import { covidcasesDefinition } from './odessee/covid-cases';
import { disasterincidentDefinition } from './odessee/disaster-incident';
import { drrmresourcesDefinition } from './odessee/drrm-resources';
import { evacuationsitesDefinition } from './odessee/evacuation-sites';
import { floodsusceptibilityDefinition } from './odessee/flood-susceptibility';
import { vulnerabilityriskDefinition } from './odessee/vulnerability-risk';

export const ALL_DATASETS: DatasetDefinition[] = [
  // DBL (8)
  businessDefinition,
  crimeDefinition,
  humanresourceDefinition,
  powerDefinition,
  residentialDefinition,
  telecommunicationDefinition,
  transportationDefinition,
  waterDefinition,

  // ODeSSEE (7)
  barangayhouseholdDefinition,
  covidcasesDefinition,
  disasterincidentDefinition,
  drrmresourcesDefinition,
  evacuationsitesDefinition,
  floodsusceptibilityDefinition,
  vulnerabilityriskDefinition,
];

export const DBL_DATASETS = ALL_DATASETS.filter((d) => d.system === 'DBL');
export const ODESSEE_DATASETS = ALL_DATASETS.filter((d) => d.system === 'ODeSSEE');

export function getDatasetById(id: string): DatasetDefinition | undefined {
  return ALL_DATASETS.find((d) => d.id === id);
}

export { waterDefinition, businessDefinition };
