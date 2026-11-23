import { Tab, TabGroup, TabList } from "@headlessui/react";

interface Props {
  tabs: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

/** Solo la barra de pestañas (fill): el contenido lo renderiza la página */
export const Tabs: React.FC<Props> = ({ tabs, selectedIndex, onChange }) => (
  <TabGroup selectedIndex={selectedIndex} onChange={onChange}>
    <TabList className="mt-3 flex border-b border-slate-300">
      {tabs.map((t) => (
        <Tab
          key={t}
          className="-mb-px flex-1 cursor-pointer border-b-2 border-transparent px-4 py-2 text-center font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-accent-500 data-selected:border-brand-700 data-selected:text-brand-900"
        >
          {t}
        </Tab>
      ))}
    </TabList>
  </TabGroup>
);
