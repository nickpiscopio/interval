// Icon library: https://oblador.github.io/react-native-vector-icons/
import Ionicons from '@expo/vector-icons/MaterialCommunityIcons';

export type IntervalImage = typeof IntervalImage[keyof typeof IntervalImage]
export const IntervalImage = {
    delete: <Ionicons name="delete" size={32} color="green" />,
    save: <Ionicons name="content-save" size={32} color="green" />
} as const

