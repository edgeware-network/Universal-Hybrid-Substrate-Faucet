export interface IconData {
  name: string;
  symbol: string;
  iconUrl: string;
}

export interface IconConfig {
  id: number;
  data: IconData;
  position: {
    top: string;
    left: string;
  };
  style: {
    width: string;
    height: string;
    animationDuration: string;
    animationDelay: string;
  };
  colors: {
    primary: string;
    gradient: string;
  };
}

export interface IconProps {
  icon: IconConfig;
  isHovered: boolean;
  isAnyIconHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}
