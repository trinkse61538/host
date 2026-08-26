export function buildCleanerMessage(cleaner: string, selectedApartments: string[]): string {
  const cleanedHandle = cleaner.trim();
  const handle = cleanedHandle
    ? (cleanedHandle.startsWith('@') ? cleanedHandle : `@${cleanedHandle}`)
    : '@';

  const unitList = selectedApartments
    .map((name, index) => `${index + 1}. Apartment ${name}`)
    .join('\n');

  const countLabel = selectedApartments.length || '[No units selected]';
  const unitWord = selectedApartments.length === 1 ? 'unit' : 'units';

  return `Hi ${handle}
Just a quick reminder that you have cleaned ${countLabel} ${unitWord} today:

${unitList}

Could you please fill in the missing supplies/amenities in the Stock Tracker file?

Thank you so much for your help! 🙏`;
}
