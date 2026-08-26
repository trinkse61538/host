import type { ManagedApartment, ParkingGuide, ParkingPhoto } from '../../domain/models';
import { emptyParkingGuide } from '../../infrastructure/firebase/apartmentRepository';

interface ParkingDefault {
  matches: string[];
  guide: Omit<ParkingGuide, 'photos'> & { photos?: ParkingPhoto[] };
}

function photo(path: string, captionVi: string, captionEn: string): ParkingPhoto {
  return { path: `media/parking/${path}`, captionVi, captionEn };
}

function guide(value: Partial<ParkingGuide>): ParkingGuide {
  return { ...emptyParkingGuide(), enabled: true, ...value };
}

const DEFAULTS: ParkingDefault[] = [
  {
    matches: ['3br enclave | fish market & casino', 'brick enclave | 3bdr harbour & casino', 'bliss enclave | 3br casino home'],
    guide: guide({
      statusVi: 'Bãi xe trả phí · chủ nhà hoàn lại', statusEn: 'Paid parking · reimbursed by host',
      locationVi: 'Bãi xe an toàn gần căn hộ, đi bộ khoảng 3–4 phút', locationEn: 'Secure paid car park nearby, about a 3–4 minute walk',
      accessVi: 'Tap & pay hoặc đặt chỗ trước', accessEn: 'Tap & pay or pre-book',
      noteVi: 'Không có thẻ đậu xe cần nhận. Hãy giữ hóa đơn hoặc xác nhận đặt chỗ để được hoàn lại chi phí.',
      noteEn: 'There is no parking card to collect. Keep the receipt or booking confirmation for reimbursement.',
      instructionsVi: ['Bãi đậu xe nằm ngoài tòa nhà, cách căn hộ khoảng 3–4 phút đi bộ.', 'Khách có thể tap & pay hoặc đặt chỗ trước.', 'Giữ hóa đơn hoặc xác nhận đặt chỗ và gửi cho chủ nhà để được hoàn lại chi phí.'],
      instructionsEn: ['Parking is off-site, approximately a 3–4 minute walk from the apartment.', 'Use tap & pay at the car park or pre-book a space.', 'Keep the receipt or booking confirmation and send it to the host for reimbursement.'],
      messageVi: 'Bãi đậu xe nằm gần căn hộ, cách khoảng 3–4 phút đi bộ. Bạn có thể tap & pay hoặc đặt trước. Vui lòng giữ hóa đơn để bên mình hoàn lại chi phí đậu xe.',
      messageEn: 'Parking is available at a secure paid car park about a 3–4 minute walk away. You may tap & pay or pre-book. Please keep the receipt so we can reimburse the parking cost.',
    }),
  },
  {
    matches: ['bliss terrace city pad | 2 balcony'],
    guide: guide({
      statusVi: 'Đậu xe miễn phí', statusEn: 'Free parking included',
      locationVi: '1–19 Allen Street, Pyrmont', locationEn: '1–19 Allen Street, Pyrmont',
      accessVi: 'Nhận remote fob trong hộp thư trước', accessEn: 'Collect the remote fob from the mailbox first',
      spot: 'Garage #77',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=1-19+Allen+Street+Pyrmont+NSW',
      noteVi: 'Đây là khu dân cư. Không nhắc đến Airbnb. Nếu được hỏi, hãy nói bạn là bạn của chủ chỗ đậu xe.',
      noteEn: 'This is a residential building. Do not mention Airbnb. If asked, say you are a friend of the parking owner.',
      instructionsVi: ['Nhận bộ chìa khóa và remote fob trước.', 'Đi đến 1–19 Allen Street, Pyrmont và dùng remote fob để vào bãi xe.', 'Đậu đúng Garage #77.', 'Khi trả phòng, trả lại remote fob cùng bộ chìa khóa.'],
      instructionsEn: ['Collect the keyset and remote fob first.', 'Drive to 1–19 Allen Street, Pyrmont and use the fob to enter.', 'Park only in Garage #77.', 'Return the remote fob together with the keyset at checkout.'],
      messageVi: 'Bên mình có chỗ đậu xe miễn phí tại 1–19 Allen Street, Pyrmont. Hãy nhận remote fob trước và đậu đúng Garage #77.',
      messageEn: 'Complimentary parking is available at 1–19 Allen Street, Pyrmont. Collect the remote fob first and park only in Garage #77.',
    }),
  },
  {
    matches: ['blue enclave | casino & darling harbour walk'],
    guide: guide({
      statusVi: 'Đậu xe miễn phí · vui lòng báo trước', statusEn: 'Free parking · please let us know in advance',
      locationVi: '152 Bulwara Road, Pyrmont NSW 2009', locationEn: '152 Bulwara Road, Pyrmont NSW 2009',
      accessVi: 'Dùng key fob trong keyset tại cổng', accessEn: 'Use the key fob from the keyset at the gate',
      spot: 'Parking spot #64',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=152+Bulwara+Road+Pyrmont+NSW+2009',
      noteVi: 'Chỉ đậu đúng ô #64 và không nhắc đến Airbnb trong khu vực bãi xe.',
      noteEn: 'Park only in spot #64 and do not mention Airbnb in the parking area.',
      instructionsVi: ['Nhận key fob trong keyset.', 'Đi đến 152 Bulwara Road và quét fob tại cổng.', 'Đậu đúng parking spot #64.'],
      instructionsEn: ['Collect the key fob from the keyset.', 'Drive to 152 Bulwara Road and tap the fob at the gate.', 'Park only in parking spot #64.'],
      messageVi: 'Có 1 chỗ đậu xe miễn phí tại 152 Bulwara Road. Hãy dùng key fob để vào và đậu đúng spot #64.',
      messageEn: 'One complimentary parking space is available at 152 Bulwara Road. Use the key fob to enter and park only in spot #64.',
      photos: [
        photo('blue-enclave-building.jpg', 'Mặt tiền tòa nhà và lối xuống bãi xe.', 'Building and car park entrance.'),
        photo('blue-enclave-key-fob.jpg', 'Quét key fob tại đầu đọc cạnh cổng.', 'Scan the key fob at the gate reader.'),
        photo('blue-enclave-spot-64.jpg', 'Đậu đúng parking spot #64.', 'Park only in parking spot #64.'),
      ],
    }),
  },
  {
    matches: ['casino enclave | prime 3br + fish market'],
    guide: guide({
      statusVi: 'Đậu xe miễn phí · vui lòng báo trước', statusEn: 'Free parking · please let us know in advance',
      locationVi: '152 Bulwara Road, Pyrmont NSW 2009 · cách căn hộ khoảng 4 phút đi bộ', locationEn: '152 Bulwara Road, Pyrmont NSW 2009 · approximately a 4-minute walk',
      accessVi: 'Lấy key fob trong keyset rồi quét tại cổng', accessEn: 'Collect the key fob from the keyset, then tap it at the gate',
      spot: 'Parking spot #57',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=152+Bulwara+Road+Pyrmont+NSW+2009',
      noteVi: 'Chỉ đậu đúng ô #57, nằm xuống 1 tầng và ngay cạnh thang máy LEVEL 2. Không nhắc đến Airbnb.',
      noteEn: 'Park only in spot #57, one level down beside the LEVEL 2 lifts. Do not mention Airbnb.',
      instructionsVi: ['Báo trước nếu cần giữ chỗ.', 'Lấy key fob trong keyset.', 'Quét key fob tại cổng 152 Bulwara Road.', 'Đậu đúng spot #57 cạnh thang máy LEVEL 2.', 'Quét fob tại thang máy và bấm Level 4 để ra ground level.'],
      instructionsEn: ['Let us know in advance if parking is required.', 'Collect the key fob from the keyset.', 'Tap the fob at the 152 Bulwara Road gate.', 'Park only in spot #57 beside the LEVEL 2 lifts.', 'Tap the fob at the lifts and press Level 4 to reach ground level.'],
      messageVi: 'Có 1 chỗ đậu xe miễn phí tại 152 Bulwara Road, cách căn hộ khoảng 4 phút đi bộ. Dùng key fob và đậu đúng spot #57 cạnh thang máy LEVEL 2.',
      messageEn: 'One complimentary parking space is available at 152 Bulwara Road, about a 4-minute walk away. Use the key fob and park only in spot #57 beside the LEVEL 2 lifts.',
      photos: [
        photo('casino-enclave-building.jpg', 'Mặt tiền The Darlington và lối xuống bãi xe.', 'The Darlington building and car park entrance.'),
        photo('casino-enclave-key-fob.jpg', 'Quét key fob tại đầu đọc ở cổng.', 'Tap the key fob at the gate reader.'),
        photo('casino-enclave-level-2-lifts.jpg', 'Khu thang máy LEVEL 2.', 'LEVEL 2 lift area.'),
        photo('casino-enclave-spot-57.jpg', 'Đậu đúng parking spot #57.', 'Park only in parking spot #57.'),
      ],
    }),
  },
  {
    matches: ['corfu house | steps of cbd'],
    guide: guide({
      statusVi: 'Đậu xe đường phố miễn phí', statusEn: 'Free street parking',
      locationVi: 'Đậu xe trên đường gần căn hộ', locationEn: 'Street parking near the apartment',
      accessVi: 'Tuân theo biển báo đỗ xe trên đường', accessEn: 'Follow the street parking signs',
      noteVi: 'Ngày thường thường giới hạn 2 giờ; sau khoảng 4:00 PM thường không giới hạn. Cuối tuần thường miễn phí không giới hạn. Luôn kiểm tra biển báo thực tế.',
      noteEn: 'Weekdays are typically limited to 2 hours; after around 4:00 PM it is usually unlimited. Weekends are usually free and unlimited. Always check the signs.',
      instructionsVi: ['Có thể đậu xe miễn phí trên đường gần căn hộ.', 'Ngày thường thường giới hạn 2 giờ.', 'Sau khoảng 4:00 PM và cuối tuần thường không giới hạn.', 'Luôn kiểm tra biển báo tại vị trí đậu xe.'],
      instructionsEn: ['Free street parking is available near the apartment.', 'Weekdays are typically limited to 2 hours.', 'After around 4:00 PM and on weekends it is usually unlimited.', 'Always check the local parking signs.'],
    }),
  },
  {
    matches: ['heavens panorama | water views'],
    guide: guide({
      statusVi: 'Có bãi xe trả phí tại chỗ', statusEn: 'Affordable on-site paid parking',
      locationVi: 'Bãi xe ngay tại chỗ / trong khuôn viên', locationEn: 'On-site parking',
      accessVi: 'Có thể đặt trước hoặc đặt khi đến', accessEn: 'Can be pre-booked or booked on arrival',
      noteVi: 'Có thể pre-book chỗ đậu xe tại chỗ với mức phí khá hợp lý; nếu chưa đặt trước vẫn có thể đặt khi đến.',
      noteEn: 'On-site parking can be pre-booked at an affordable cost, or arranged on arrival.',
      instructionsVi: ['Có bãi xe trả phí tại chỗ.', 'Bạn có thể đặt trước hoặc đặt khi đến nơi.'],
      instructionsEn: ['Affordable on-site paid parking is available.', 'You can pre-book it or arrange it on arrival.'],
    }),
  },
  {
    matches: ['the penthouse on pyrmont'],
    guide: guide({
      statusVi: 'Bãi xe trả phí gần căn hộ', statusEn: 'Nearby paid parking',
      locationVi: 'Các bãi xe công cộng tại Pyrmont', locationEn: 'Public car parks around Pyrmont',
      accessVi: 'Đặt trước online/app hoặc drive-in', accessEn: 'Pre-book online/in the app or drive in',
      noteVi: 'Khuyến nghị đặt trước để có giá tốt hơn.', noteEn: 'Pre-booking is recommended for a better rate.',
      instructionsVi: ['Căn hộ không có chỗ đậu xe riêng.', 'Sử dụng bãi xe trả phí gần Pyrmont và nên đặt trước.'],
      instructionsEn: ['The apartment does not include a private parking space.', 'Use a nearby paid car park in Pyrmont and pre-book where possible.'],
    }),
  },
  {
    matches: ['122 kirribilli · timeless harbour enclave', '122 kirribilli | timeless harbour enclave', 'waterside enclave home'],
    guide: guide({
      statusVi: 'Đậu xe đường phố', statusEn: 'Street parking',
      locationVi: 'Kirribilli và các đường xung quanh', locationEn: 'Kirribilli and surrounding streets',
      accessVi: 'Kiểm tra biển báo và giới hạn thời gian', accessEn: 'Check signs and time restrictions',
      noteVi: 'Khu vực có street parking nhưng điều kiện thay đổi theo từng đoạn đường.', noteEn: 'Street parking is available, but restrictions vary by street section.',
      instructionsVi: ['Tìm street parking gần căn hộ.', 'Luôn kiểm tra biển báo và giới hạn thời gian trước khi rời xe.'],
      instructionsEn: ['Look for street parking near the apartment.', 'Always check the posted signs and time restrictions before leaving the car.'],
    }),
  },
  {
    matches: ['ultimo chic home | modern 2br'],
    guide: guide({
      statusVi: 'Bãi xe trả phí gần căn hộ', statusEn: 'Nearby paid parking',
      locationVi: 'Ultimo / Broadway', locationEn: 'Ultimo / Broadway',
      accessVi: 'Drive-in hoặc đặt trước', accessEn: 'Drive in or pre-book',
      noteVi: 'Không có chỗ đậu xe miễn phí cố định trong căn.', noteEn: 'No dedicated complimentary parking is included with the apartment.',
      instructionsVi: ['Căn hộ không có parking miễn phí cố định.', 'Sử dụng street parking hoặc bãi xe công cộng gần Ultimo/Broadway.'],
      instructionsEn: ['No dedicated complimentary parking is included.', 'Use street parking or a public car park around Ultimo/Broadway.'],
    }),
  },
  {
    matches: ['bayside enclave | casino & harbour', 'darling harbour gem • pool & balcony'],
    guide: guide({
      statusVi: 'Đậu xe miễn phí trong tòa nhà', statusEn: 'Complimentary building parking',
      locationVi: 'Bãi xe trong khu Harbourside / Pyrmont', locationEn: 'Harbourside / Pyrmont building car park',
      accessVi: 'Dùng fob để vào cổng và đi xuống Level 2', accessEn: 'Use the fob at the gate and proceed to Level 2',
      noteVi: 'Dùng đúng chỗ đậu xe được chỉ định và giữ fob trong suốt thời gian lưu trú.', noteEn: 'Use the designated bay only and keep the fob with you during the stay.',
      instructionsVi: ['Dùng fob tại cổng bãi xe.', 'Đi xuống Level 2 theo hướng dẫn ảnh.', 'Đậu đúng vị trí đã chỉ định.', 'Giữ fob và trả lại cùng keyset khi checkout.'],
      instructionsEn: ['Use the fob at the car park gate.', 'Proceed to Level 2 as shown in the photos.', 'Park only in the designated bay.', 'Keep the fob and return it with the keyset at checkout.'],
      photos: [
        photo('bayside-enclave-harbourside-entrance.jpg', 'Lối vào khu Harbourside.', 'Harbourside entrance.'),
        photo('bayside-enclave-fob-gate.jpg', 'Dùng fob tại cổng bãi xe.', 'Use the fob at the parking gate.'),
        photo('bayside-enclave-level-2-panorama.jpg', 'Toàn cảnh Level 2.', 'Level 2 overview.'),
        photo('bayside-enclave-spot-wide.jpg', 'Vị trí đậu xe nhìn từ xa.', 'Parking bay, wide view.'),
        photo('bayside-enclave-spot-close.jpg', 'Vị trí đậu xe nhìn gần.', 'Parking bay, close view.'),
      ],
    }),
  },
  {
    matches: ['panoramic escape | bridge & opera gem', 'panoramic escape: bridge & opera gem', 'fireworks & billion $ views'],
    guide: guide({
      statusVi: 'Đậu xe trong tòa nhà', statusEn: 'Building parking',
      locationVi: 'Bãi xe của tòa nhà', locationEn: 'Building car park',
      accessVi: 'Dùng key/fob theo hướng dẫn', accessEn: 'Use the key/fob as instructed',
      spot: 'Spot #35',
      noteVi: 'Đậu đúng spot #35.', noteEn: 'Park only in spot #35.',
      instructionsVi: ['Vào bãi xe theo lối trong ảnh.', 'Đi đến đúng parking spot #35.'],
      instructionsEn: ['Enter the car park as shown in the photos.', 'Proceed to parking spot #35.'],
      photos: [
        photo('panoramic-escape-overview.jpg', 'Tổng quan lối vào bãi xe.', 'Car park overview.'),
        photo('panoramic-escape-spot-35.jpg', 'Đậu đúng spot #35.', 'Park only in spot #35.'),
      ],
    }),
  },
  {
    matches: ['sun-lit oasis | darling harbour', 'city waterside 1bdr | casino & market'],
    guide: guide({
      statusVi: 'Không có parking cố định trong căn', statusEn: 'No dedicated parking included',
      locationVi: 'Các bãi xe trả phí gần Pyrmont / Darling Harbour', locationEn: 'Paid parking around Pyrmont / Darling Harbour',
      accessVi: 'Đặt trước hoặc drive-in', accessEn: 'Pre-book or drive in',
      noteVi: 'Khuyến nghị đặt trước để đảm bảo chỗ và có giá tốt hơn.', noteEn: 'Pre-booking is recommended to secure a space and a better rate.',
      instructionsVi: ['Căn hộ không kèm chỗ đậu xe cố định.', 'Sử dụng bãi xe trả phí gần Pyrmont/Darling Harbour và nên đặt trước.'],
      instructionsEn: ['The apartment does not include a dedicated parking bay.', 'Use a nearby paid car park around Pyrmont/Darling Harbour and pre-book if possible.'],
    }),
  },
  {
    matches: ['the grand pyrmont | casino & harbour', 'grand pyrmont'],
    guide: guide({
      statusVi: 'Đậu xe riêng gần căn hộ', statusEn: 'Private parking near the apartment',
      locationVi: 'Khu Pyrmont, gần căn hộ', locationEn: 'Pyrmont, near the apartment',
      accessVi: 'Đi theo lối trong ảnh đến private bay', accessEn: 'Follow the photo directions to the private bay',
      noteVi: 'Vui lòng sử dụng đúng private bay được chỉ định.', noteEn: 'Use only the designated private bay.',
      instructionsVi: ['Đi đến khu parking theo ảnh lối vào.', 'Theo lane direction đến đúng nhà/vị trí.', 'Đậu đúng private bay.'],
      instructionsEn: ['Go to the parking complex shown in the entrance photo.', 'Follow the lane direction to the correct house/location.', 'Park only in the private bay.'],
      photos: [
        photo('grand-pyrmont-complex-entrance.jpg', 'Lối vào khu parking.', 'Parking complex entrance.'),
        photo('grand-pyrmont-lane-direction.jpg', 'Hướng đi trong lane.', 'Lane direction.'),
        photo('grand-pyrmont-house-69.jpg', 'Vị trí nhà cần tìm.', 'House/location reference.'),
        photo('grand-pyrmont-private-bay.jpg', 'Private parking bay.', 'Private parking bay.'),
      ],
    }),
  },
  {
    matches: ['luxury 1bdr | sparkling harbourside', 'marble enclave | luxury convenience'],
    guide: guide({
      statusVi: 'Không có parking miễn phí trong tòa nhà', statusEn: 'No complimentary building parking',
      locationVi: 'Các bãi xe trả phí quanh Town Hall / Darling Harbour', locationEn: 'Paid car parks around Town Hall / Darling Harbour',
      accessVi: 'Pre-book online/app hoặc drive-in', accessEn: 'Pre-book online/in the app or drive in',
      noteVi: 'Khuyến nghị St Andrews House Town Hall hoặc Cinema Centre; đặt trước thường rẻ hơn.',
      noteEn: 'St Andrews House Town Hall or Cinema Centre are practical options; pre-booking is usually cheaper.',
      instructionsVi: ['Căn hộ không bao gồm parking miễn phí.', 'Có thể dùng St Andrews House Town Hall hoặc Cinema Centre Car Park.', 'Khuyến nghị đặt trước qua app để có giá tốt hơn.'],
      instructionsEn: ['Free parking is not included.', 'St Andrews House Town Hall or Cinema Centre Car Park are nearby options.', 'Pre-booking in the app is recommended for a better rate.'],
    }),
  },
  {
    matches: ['luxury 3br skyline | water views'],
    guide: guide({
      statusVi: 'Không có parking trong tòa nhà · cần đặt bãi xe gần đó', statusEn: 'No parking in the building · nearby paid parking required',
      locationVi: 'Gần 38 York Street: 383 Kent Street, George Place hoặc 71 York Street', locationEn: 'Near 38 York Street: 383 Kent Street, George Place or 71 York Street',
      accessVi: 'Đặt trước online/app để có giá tốt hơn hoặc drive-in', accessEn: 'Pre-book online/in the app for a better rate or drive in',
      mapUrl: 'https://www.wilsonparking.com.au/parking-locations/new-south-wales/cbd-sydney-south/383-kent-st-car-park/',
      noteVi: 'Không có parking trong tòa nhà tại 38 York Street. Khuyến nghị public transport; nếu lái xe nên pre-book vì drive-in thường đắt hơn.',
      noteEn: 'There is no parking in the building at 38 York Street. Public transport is recommended; if driving, pre-book because drive-in rates are usually higher.',
      instructionsVi: ['38 York Street không có parking trong tòa nhà.', 'Lựa chọn chính: 383 Kent Street Car Park.', 'Có thể dùng George Place hoặc 71 York Street.', 'Pre-book thường rẻ hơn drive-in.'],
      instructionsEn: ['There is no parking in the building at 38 York Street.', 'First option: 383 Kent Street Car Park.', 'George Place or 71 York Street are alternatives.', 'Pre-booking is usually cheaper than drive-in.'],
    }),
  },
  {
    matches: ['maritime manor | coastal terrace'],
    guide: guide({
      statusVi: 'Đậu xe miễn phí có giới hạn thời gian', statusEn: 'Time-limited free parking available',
      locationVi: 'Đậu xe trên đường và bãi xe có mái che gần căn hộ', locationEn: 'Street parking and nearby undercover parking',
      accessVi: 'Tuân theo biển báo và giới hạn thời gian tại chỗ', accessEn: 'Follow the posted signs and time limits',
      noteVi: 'Có street parking miễn phí khoảng 1–2 giờ và bãi có mái che miễn phí tối đa 2 giờ. Luôn kiểm tra biển báo.',
      noteEn: 'Free street parking is available for around 1–2 hours and nearby undercover parking for up to 2 hours. Always check the signs.',
      instructionsVi: ['Có thể đậu xe miễn phí trên đường khoảng 1–2 giờ.', 'Gần đó có bãi có mái che miễn phí tối đa 2 giờ.', 'Kiểm tra biển báo tại chỗ.'],
      instructionsEn: ['Free street parking is available for around 1–2 hours.', 'Nearby undercover parking is free for up to 2 hours.', 'Check the posted signs on arrival.'],
    }),
  },
  {
    matches: ['millers manor terrace | 3br', '3bdr historic waterside enclave | casino'],
    guide: guide({
      statusVi: 'Đậu xe tại Barangaroo Point bằng access card', statusEn: 'Barangaroo Point parking with access card',
      locationVi: 'Barangaroo Point Car Park · 25 Hickson Road, Barangaroo', locationEn: 'Barangaroo Point Car Park · 25 Hickson Road, Barangaroo',
      accessVi: 'Chạm access card vào cảm biến màu xanh tại cổng', accessEn: 'Hold the access card against the green sensor at the gate',
      spot: 'Chỉ đậu ô không ghi RESERVED',
      mapUrl: 'https://share.google/LiueHkocRqNSRvSnZ',
      noteVi: 'Chỉ sử dụng Barangaroo Point Wilson Parking; không vào bãi Wilson khác. Chỉ đậu ô không ghi RESERVED.',
      noteEn: 'Use Barangaroo Point Wilson Parking only. Park only in a bay that is not marked RESERVED.',
      instructionsVi: ['Đi đến Barangaroo Point Car Park tại 25 Hickson Road.', 'Dùng access card tại cảm biến màu xanh ở cổng.', 'Chỉ đậu ô không ghi RESERVED.', 'Giữ access card và trả lại cùng keyset.'],
      instructionsEn: ['Drive to Barangaroo Point Car Park at 25 Hickson Road.', 'Use the access card at the green gate sensor.', 'Park only in a bay that is not marked RESERVED.', 'Keep the access card and return it with the keyset.'],
      photos: [photo('millers-manor-barangaroo-point.jpg', 'Lối vào Barangaroo Point Car Park.', 'Barangaroo Point Car Park entrance.')],
    }),
  },
];

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function hasStoredParking(apartment: ManagedApartment): boolean {
  const parking = apartment.parking;
  return Boolean(
    parking.enabled
      || parking.statusVi || parking.statusEn || parking.locationVi || parking.locationEn
      || parking.accessVi || parking.accessEn || parking.spot || parking.mapUrl
      || parking.noteVi || parking.noteEn || parking.instructionsVi.length
      || parking.instructionsEn.length || parking.messageVi || parking.messageEn
      || parking.photos.length,
  );
}

export function defaultParkingFor(apartment: ManagedApartment): ParkingGuide | null {
  const normalized = normalize(apartment.apartment);
  const entry = DEFAULTS.find(item => item.matches.some(match => normalized.includes(normalize(match))));
  return entry ? guide(entry.guide) : null;
}

export function effectiveParking(apartment: ManagedApartment): ParkingGuide | null {
  if (hasStoredParking(apartment)) return apartment.parking;
  return defaultParkingFor(apartment);
}

export function hasParkingGuide(apartment: ManagedApartment): boolean {
  const parking = effectiveParking(apartment);
  return Boolean(parking?.enabled || parking?.statusEn || parking?.statusVi || parking?.instructionsEn.length || parking?.instructionsVi.length);
}
