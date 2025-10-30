import Input from "./Input";
import Select from "./Select";
import TextArea from "./TextArea";
import Checkbox from "./Checkbox";
import Radio from "./Radio";
import "./formExample.css";

export default function FormExample() {
  return (
    <div className="form-grid">
      <div className="fg-row">
        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <Input label="Email" placeholder="Enter your email address" />
        </div>
        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <Input
            label="Password"
            placeholder="Set a password"
            type="password"
            passwordToggle
          />
        </div>
        <div className="fg-col-12 fg-col-lg-6">
          <Input label="Address" placeholder="What is your address?" />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <Input label="Town" placeholder="Enter your town" />
        </div>
        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <Input label="State" placeholder="Select your state" />
        </div>
        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <Input label="Zip" placeholder="What is your zip code" />
        </div>
        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <Input label="Country" placeholder="Select your country" />
        </div>
      </div>
      {/* Additional examples: select, textarea, checkbox, date */}
      <div className="fg-row">
        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <Select
            label="Vehicle Type"
            options={[
              { value: "", label: "Select..." },
              { value: "car", label: "Car" },
              { value: "motorcycle", label: "Motorcycle" },
              { value: "truck", label: "Truck" },
            ]}
          />
        </div>

        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <Input label="Service Date" placeholder="Select a date" type="date" />
        </div>

        <div className="fg-col-12 fg-col-lg-6">
          <TextArea label="Notes" rows={3} />
        </div>
      </div>

      <div className="fg-row">
        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <Checkbox label="Send invoice by email" />
        </div>
      </div>

      <div className="fg-row">
        <div className="fg-col-12 fg-col-md-6 fg-col-lg-3">
          <div style={{ display: "flex", gap: 12 }}>
            <Radio name="payment" value="card" label="Card" />
            <Radio name="payment" value="cash" label="Cash" />
            <Radio name="payment2" value="paypal" label="PayPal" />
            <Radio name="payment2" value="bank" label="Bank Transfer" />
          </div>
        </div>
      </div>
    </div>
  );
}
