export const sports = [
  { value: 'basketball', title: 'Basketball', icon: 'mdi-basketball' },
  { value: 'football', title: 'Football', icon: 'mdi-soccer' },
  { value: 'volleyball', title: 'Volleyball', icon: 'mdi-volleyball' },
  { value: 'tennis', title: 'Tennis', icon: 'mdi-tennis' },
  { value: 'badminton', title: 'Badminton', icon: 'mdi-badminton' },
  { value: 'running', title: 'Running', icon: 'mdi-run' },
  { value: 'workout', title: 'Workout', icon: 'mdi-dumbbell' },
  { value: 'other', title: 'Other', icon: 'mdi-trophy-outline' },
]

export function sportIcon(value) {
  return sports.find((s) => s.value === value)?.icon ?? 'mdi-trophy-outline'
}
