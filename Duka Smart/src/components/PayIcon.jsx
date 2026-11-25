import mpesa from "../assets/pay/mpesa.svg";
import visa from "../assets/pay/visa.svg";
import mastercard from "../assets/pay/mastercard.svg";

// the logos of the three ways a customer can pay (logos belong to their owners; M-Pesa, Visa and Mastercard)
function PayIcon({ method }) {
  if (method === "M-Pesa") {
    return <img className="pay-logo mpesa" src={mpesa} alt="M-Pesa" />;
  }
  if (method === "Card") {
    return (
      <span className="pay-card">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20M6 15h4" /></svg>
        <span className="marks">
          <img src={visa} alt="Visa" />
          <img src={mastercard} alt="Mastercard" />
        </span>
      </span>
    );
  }
  return (
    <svg className="pay-cash" viewBox="0 0 24 24" aria-label="Cash">
      <rect x="2" y="6" width="20" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.8" />
      <path d="M6 9.5v.01M18 14.5v.01" />
    </svg>
  );
}

export default PayIcon;
