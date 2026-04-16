import { useState } from "react";
import {
    ArrowLeft,
    Search,
    SlidersHorizontal,
    PoundSterling,
    MapPin,
    Star,
    Home,
    Sofa,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import "../styles/browse.css";

export default function Browse() {
    // price range slide
    const navigate = useNavigate();

    const [minPrice, setMinPrice] = useState(400);
    const [maxPrice, setMaxPrice] = useState(1200);

    const [location, setLocation] = useState("Aberdeenshire");
    const [distanceFrom, setDistanceFrom] = useState([]);
    const [rating, setRating] = useState("Any");
    const [billsIncluded, setBillsIncluded] = useState(false);
    const [propertyType, setPropertyType] = useState([]);
    const [furnished, setFurnished] = useState("Any");

    const minLimit = 300;
    const maxLimit = 1500;

    const minPercent = ((minPrice - minLimit) / (maxLimit - minLimit)) * 100;
    const maxPercent = ((maxPrice - minLimit) / (maxLimit - minLimit)) * 100;

    // other filter selection
    function toggleMultiSelect(value, selectedValues, setSelectedValues) {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter((item) => item !== value));
        } else {
            setSelectedValues([...selectedValues, value]);
        }
    }

    // clear all filters
    function handleClearFilters() {
        setSearchTerm("");
        setMinPrice(400);
        setMaxPrice(1200);
        setLocation("Aberdeenshire");
        setDistanceFrom([]);
        setRating("Any");
        setBillsIncluded(false);
        setPropertyType([]);
        setFurnished("Any");
    }

    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="page-container browse-page">
            <header className="browse-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    Back
                </button>
                <Logo />
            </header>

            <div className="search-bar">
                <Search size={16} />
                <input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="filters-header">
                <SlidersHorizontal size={18} />
                <h3>Filters</h3>
            </div>

            <div className="filter-card">
                <h4>
                    <PoundSterling size={16} />
                    Price Range
                </h4>

                <div className="price-values">
                    <span>£{minPrice}/month</span>
                    <span>£{maxPrice}/month</span>
                </div>

                <div className="range-slider">
                    <div className="slider-track"></div>
                    <div
                        className="slider-range"
                        style={{
                            left: `${minPercent}%`,
                            width: `${maxPercent - minPercent}%`,
                        }}
                    ></div>

                    <input
                        type="range"
                        min={minLimit}
                        max={maxLimit}
                        value={minPrice}
                        onChange={(e) =>
                            setMinPrice(Math.min(Number(e.target.value), maxPrice - 50))
                        }
                        className="thumb thumb-left"
                    />

                    <input
                        type="range"
                        min={minLimit}
                        max={maxLimit}
                        value={maxPrice}
                        onChange={(e) =>
                            setMaxPrice(Math.max(Number(e.target.value), minPrice + 50))
                        }
                        className="thumb thumb-right"
                    />
                </div>
            </div>

            <div className="filter-card">
                <h4>
                    <MapPin size={16} />
                    Location
                </h4>
                <div className="pill-group">
                    {["Aberdeenshire", "Aberdeen City", "Dundee", "Edinburgh"].map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`pill ${location === item ? "active" : ""}`}
                            onClick={() => setLocation(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-card">
                <h4>
                    <MapPin size={16} />
                    Distance From
                </h4>
                <div className="pill-group">
                    {[
                        "Robert Gordon University",
                        "Aberdeen University",
                        "NESCOL",
                        "City Centre",
                    ].map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`pill ${distanceFrom.includes(item) ? "active" : ""}`}
                            onClick={() =>
                                toggleMultiSelect(item, distanceFrom, setDistanceFrom)
                            }
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-card">
                <h4>
                    <Star size={16} />
                    Minimum Rating
                </h4>
                <div className="pill-group">
                    {["Any", "3+", "4+", "5+"].map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`pill ${rating === item ? "active" : ""}`}
                            onClick={() => setRating(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-card toggle">
                <h4>Bills Included</h4>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={billsIncluded}
                        onChange={() => setBillsIncluded(!billsIncluded)}
                    />
                    <span className="slider"></span>
                </label>
            </div>

            <div className="filter-card">
                <h4>
                    <Home size={16} />
                    Property Type
                </h4>
                <div className="pill-group">
                    {["Studio", "Flatshare", "One-Bed"].map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`pill ${propertyType.includes(item) ? "active" : ""}`}
                            onClick={() =>
                                toggleMultiSelect(item, propertyType, setPropertyType)
                            }
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-card">
                <h4>
                    <Sofa size={16} />
                    Furnished
                </h4>
                <div className="pill-group">
                    {["Any", "Yes", "No"].map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`pill ${furnished === item ? "active" : ""}`}
                            onClick={() => setFurnished(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>


            <button
                className="primary-btn"
                onClick={() =>
                    navigate("/results", {
                        state: {
                            searchTerm,
                            minPrice,
                            maxPrice,
                            location,
                            distanceFrom,
                            rating,
                            billsIncluded,
                            propertyType,
                            furnished,
                        },
                    })
                }
            >
                Show Results
            </button>
            <button className="secondary-btn" onClick={handleClearFilters}>
                Clear All Filters
            </button>
        </div>
    );
}