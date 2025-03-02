/**
 * Comprehensive list of world timezones
 * Each timezone includes a GMT-formatted value and a descriptive label with cities
 * For timezones with the same GMT offset, a unique identifier suffix is added to ensure value uniqueness
 */
export const TIMEZONES = [
  { value: "GMT-12:00", label: "GMT-12:00 International Date Line West" },
  { value: "GMT-11:00", label: "GMT-11:00 Midway Island, Samoa" },
  { value: "GMT-10:00", label: "GMT-10:00 Hawaii" },
  { value: "GMT-09:00", label: "GMT-09:00 Alaska" },
  { value: "GMT-08:00", label: "GMT-08:00 Pacific Time (US & Canada)" },
  { value: "GMT-07:00", label: "GMT-07:00 Arizona" },
  { value: "GMT-06:00", label: "GMT-06:00 Central Time (US & Canada)" },
  { value: "GMT-05:00", label: "GMT-05:00 Eastern Time (US & Canada)" },
  { value: "GMT-04:00", label: "GMT-04:00 Atlantic Time (Canada)" },
  { value: "GMT-03:30", label: "GMT-03:30 Newfoundland" },
  { value: "GMT-03:00", label: "GMT-03:00 Brasilia" },
  { value: "GMT-02:00", label: "GMT-02:00 Mid-Atlantic" },
  { value: "GMT-01:00", label: "GMT-01:00 Azores" },
  { value: "GMT+00:00", label: "GMT+00:00 London, Dublin, Edinburgh" },
  { value: "GMT+01:00", label: "GMT+01:00 Paris, Madrid, Rome" },
  { value: "GMT+02:00", label: "GMT+02:00 Athens, Bucharest, Istanbul" },
  { value: "GMT+03:00", label: "GMT+03:00 Moscow, St. Petersburg" },
  { value: "GMT+03:30", label: "GMT+03:30 Tehran" },
  { value: "GMT+04:00", label: "GMT+04:00 Abu Dhabi, Muscat" },
  { value: "GMT+04:30", label: "GMT+04:30 Kabul" },
  { value: "GMT+05:00", label: "GMT+05:00 Ekaterinburg" },
  { value: "GMT+05:30", label: "GMT+05:30 Chennai, Kolkata, Mumbai, New Delhi" },
  { value: "GMT+05:45", label: "GMT+05:45 Kathmandu" },
  { value: "GMT+06:00", label: "GMT+06:00 Astana, Dhaka" },
  { value: "GMT+06:30", label: "GMT+06:30 Yangon (Rangoon)" },
  { value: "GMT+07:00", label: "GMT+07:00 Bangkok, Hanoi, Jakarta" },
  { value: "GMT+08:00", label: "GMT+08:00 Beijing, Chongqing, Hong Kong, Singapore" },
  { value: "GMT+09:00", label: "GMT+09:00 Seoul" },
  { value: "GMT+09:30", label: "GMT+09:30 Darwin" },
  { value: "GMT+10:00", label: "GMT+10:00 Canberra, Melbourne, Sydney" },
  { value: "GMT+11:00", label: "GMT+11:00 Magadan, Solomon Is., New Caledonia" },
  { value: "GMT+12:00", label: "GMT+12:00 Auckland, Wellington" },
  { value: "GMT+13:00", label: "GMT+13:00 Nuku'alofa" },
] as const;

/**
 * Type representing a timezone entry
 */
export type Timezone = typeof TIMEZONES[number];

/**
 * Type for the timezone value
 */
export type TimezoneValue = Timezone['value'];