import { useState } from "react";

type Status = string;

export default function App() {
  const [vehicle, setVehicle] = useState({
    registration_number: "AP39AB1234", vehicle_name_model: "Ashok Leyland Truck", type: "Truck",
    max_load_capacity: 25000, odometer: 154000, acquisition_cost: 2500000.00, status: "Available",
  });
  const updateVehicleStatus = (status: Status) => setVehicle({ ...vehicle, status });

  const [driver, setDriver] = useState({
    name: "Ramesh Kumar", license_number: "DL123456789", license_category: "Heavy Vehicle",
    license_expiry_date: "2028-08-15", contact_number: "9876543210", safety_score: 95.0, status: "Available",
  });
  const updateDriverStatus = (status: Status) => setDriver({ ...driver, status });

  const [trip, setTrip] = useState({
    trip_id: "TRIP-1001", source: "Hyderabad", destination: "Vijayawada", vehicle: "Ashok Leyland Truck",
    driver: "Ramesh Kumar", cargo_weight: 18000, planned_distance: 285, status: "Draft",
  });
  const updateTripStatus = (status: Status) => setTrip({ ...trip, status });

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>TransitOps Fleet Management</h1><br />
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", marginBottom: "40px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" }}>
        <h2>Vehicle Registry</h2><p><b>Registration Number :</b> {vehicle.registration_number}</p><p><b>Vehicle Name :</b> {vehicle.vehicle_name_model}</p><p><b>Vehicle Type :</b> {vehicle.type}</p><p><b>Load Capacity :</b> {vehicle.max_load_capacity} kg</p><p><b>Odometer :</b> {vehicle.odometer} km</p><p><b>Acquisition Cost :</b> ₹{vehicle.acquisition_cost.toLocaleString('en-IN')}</p>
        <h3>Current Status : <span style={{ color: "blue" }}>{vehicle.status}</span></h3><br />
        <button onClick={() => updateVehicleStatus("Available")}>Available</button><button onClick={() => updateVehicleStatus("On Trip")}>On Trip</button><button onClick={() => updateVehicleStatus("In Shop")}>In Shop</button><button onClick={() => updateVehicleStatus("Retired")}>Retired</button>
      </div>
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", marginBottom: "40px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" }}>
        <h2>Driver Management</h2><p><b>Driver Name :</b> {driver.name}</p><p><b>License Number :</b> {driver.license_number}</p><p><b>License Category :</b> {driver.license_category}</p><p><b>License Expiry :</b> {driver.license_expiry_date}</p><p><b>Contact Number :</b> {driver.contact_number}</p><p><b>Safety Score :</b> {driver.safety_score}</p>
        <h3>Current Status : <span style={{ color: "green" }}>{driver.status}</span></h3><br />
        <button onClick={() => updateDriverStatus("Available")}>Available</button><button onClick={() => updateDriverStatus("On Trip")}>On Trip</button><button onClick={() => updateDriverStatus("Off Duty")}>Off Duty</button><button onClick={() => updateDriverStatus("Suspended")}>Suspended</button>
      </div>
      <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" }}>
        <h2>Trip Management</h2><p><b>Trip ID :</b> {trip.trip_id}</p><p><b>Source :</b> {trip.source}</p><p><b>Destination :</b> {trip.destination}</p><p><b>Vehicle :</b> {trip.vehicle}</p><p><b>Driver :</b> {trip.driver}</p><p><b>Cargo Weight :</b> {trip.cargo_weight} kg</p><p><b>Planned Distance :</b> {trip.planned_distance} km</p>
        <h3>Current Status : <span style={{ color: "red" }}>{trip.status}</span></h3><br />
        <button onClick={() => updateTripStatus("Draft")}>Draft</button><button onClick={() => updateTripStatus("Dispatched")}>Dispatch</button><button onClick={() => updateTripStatus("Completed")}>Complete</button><button onClick={() => updateTripStatus("Cancelled")}>Cancel</button>
      </div>
      <style>{`button { margin: 8px; padding: 12px 20px; font-size: 16px; border: none; border-radius: 8px; background: #2563eb; color: white; cursor: pointer; transition: 0.3s; } button:hover { background: #1d4ed8; transform: scale(1.05); }`}</style>
    </div>
  );
}
