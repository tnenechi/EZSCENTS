import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-premium-gray/20 hover:bg-premium-gray/40 transition-colors text-premium-gold"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-premium-gold" />
      ) : (
        <Sun size={20} className="text-premium-gold" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
