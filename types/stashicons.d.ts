declare module 'stashicons/react' {
  import { ComponentType, ForwardRefExoticComponent } from 'react';
  
  const stashicons: Record<string, ComponentType<any> | ForwardRefExoticComponent<any>>;
  
  export = stashicons;
}

declare module 'stashicons/react/brand' {
  import { ComponentType, ForwardRefExoticComponent } from 'react';
  
  const stashiconsBrand: Record<string, ComponentType<any> | ForwardRefExoticComponent<any>>;
  
  export = stashiconsBrand;
}

