import { FunctionComponent, useState } from "react";
import Input from "./components/Input";
import List from "./components/List";
import "./index.scss";

interface University {
  name: string;
  region: string;
}

const Task2: FunctionComponent = () => {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");

  // Danish Universities with region info
  const universities: University[] = [
    { name: "Aarhus University", region: "Central Denmark" },
    { name: "University of Copenhagen", region: "Capital Region" },
    { name: "Aalborg University", region: "North Denmark" },
    { name: "University of Southern Denmark", region: "Southern Denmark" },
    { name: "Copenhagen Business School", region: "Capital Region" },
    { name: "Technical University of Denmark", region: "Capital Region" },
    { name: "Roskilde University", region: "Zealand" },
    { name: "IT University of Copenhagen", region: "Capital Region" },
    { name: "Royal Danish Academy of Fine Arts", region: "Capital Region" },
    { name: "Royal Danish Academy of Music", region: "Capital Region" },
    { name: "VIA University College", region: "Central Denmark" },
    { name: "UCN University College of Northern Denmark", region: "North Denmark" },
    { name: "Absalon University College", region: "Zealand" },
    { name: "University College Copenhagen (KP)", region: "Capital Region" },
    { name: "UC SYD – University College South Denmark", region: "Southern Denmark" },
    { name: "Business Academy Aarhus", region: "Central Denmark" },
    { name: "Zealand Academy of Technologies and Business", region: "Zealand" },
    { name: "IBA International Business Academy", region: "Southern Denmark" },
    { name: "Lillebælt Academy", region: "Southern Denmark" },
    { name: "Dania Academy", region: "Central Denmark" },
  ];

  // Filters
  const filteredItems = universities.filter((u) => {
    const matchesQuery = u.name.toLowerCase().includes(query.toLowerCase());
    const matchesRegion = region === "All" || u.region === region;
    return matchesQuery && matchesRegion;
  });

  return (
    <div id="task-2">
      <h2>Danish Universities</h2>
      <Input
        query={query}
        region={region}
        onQueryChange={setQuery}
        onRegionChange={setRegion}
      />
      <List items={filteredItems.map((u) => u.name)} />
    </div>
  );
};

export default Task2;
