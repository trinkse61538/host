import type { ManagedApartment, SheetReport } from '../../domain/models';

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function findApartmentForReport(
  report: SheetReport,
  apartments: ManagedApartment[],
): ManagedApartment | null {
  const reportKey = normalize(report.sheetName);
  if (!reportKey) return null;

  const exact = apartments.find(apartment => normalize(apartment.apartment) === reportKey);
  if (exact) return exact;

  const candidates = apartments
    .map(apartment => {
      const apartmentName = normalize(apartment.apartment);
      const address = normalize(apartment.propertyAddress);

      let score = 99;

      // Typical migrated data:
      // Sheet: "32 Bland"
      // Apartment: "32 Bland - Maritime Manor | Coastal Terrace"
      if (apartmentName.startsWith(`${reportKey} `) || apartmentName.startsWith(reportKey)) {
        score = 0;
      } else if (reportKey.startsWith(`${apartmentName} `) || reportKey.startsWith(apartmentName)) {
        score = 1;
      } else if (address.startsWith(`${reportKey} `) || address.startsWith(reportKey)) {
        score = 2;
      } else if (
        apartmentName.includes(reportKey)
        || reportKey.includes(apartmentName)
        || address.includes(reportKey)
      ) {
        score = 3;
      }

      return { apartment, score };
    })
    .filter(candidate => candidate.score < 99)
    .sort((a, b) => (
      a.score - b.score
      || a.apartment.apartment.length - b.apartment.apartment.length
    ));

  return candidates[0]?.apartment || null;
}

export function reportApartmentSearchText(
  report: SheetReport,
  apartments: ManagedApartment[],
): string {
  const apartment = findApartmentForReport(report, apartments);

  return [
    report.sheetName,
    apartment?.apartment || '',
    apartment?.propertyAddress || '',
  ].join(' ').toLocaleLowerCase();
}
