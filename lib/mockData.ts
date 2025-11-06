import { ApiResponse } from "./types";

export const mockApiResponse: ApiResponse = {
  status: "success",
  file_name: "Hotel-Airline Rate Agreement - Sample.docx",
  output_parsed: {
    meta: {
      document_title: "HOTEL CREW RATE AGREEMENT",
      station_or_airport_code: "QNM",
      hotel_name: "The Riverside Hotel, PQR",
      airline_name: "SkyFleet Airways, Inc.",
    },
    review: [
      {
        field: "Name (Parties)",
        actual_content:
          "This Agreement is made between SkyFleet Airways, Inc., a corporation organized under the laws of Delaware with its principal office at 123 Aviation Blvd, Chicago, IL 60601, and The Riverside Hotel, PQR, located at 456 River Road, Quincy, QNM 12345.",
        compliant: "Y",
        comment:
          "Both parties' full legal names and addresses are clearly present and properly formatted.",
      },
      {
        field: "Start Date",
        actual_content: "This Agreement shall commence on January 1, 2025.",
        compliant: "Y",
        comment: "Start date is clearly specified and unambiguous.",
      },
      {
        field: "End Date",
        actual_content: "",
        compliant: "N",
        comment:
          "End date is not specified. Agreement should have a clear termination date or renewal terms.",
      },
      {
        field: "Room Rate",
        actual_content:
          "The Hotel agrees to provide rooms at a rate of $89.00 per night for single occupancy and $99.00 for double occupancy.",
        compliant: "Y",
        comment: "Room rates are clearly specified for both single and double occupancy.",
      },
      {
        field: "Room Capping",
        actual_content: "",
        compliant: "N",
        comment:
          "No room capping clause found. Agreement should specify maximum number of rooms per night.",
      },
      {
        field: "Last Room Availability (LRA)",
        actual_content:
          "Hotel guarantees last room availability for airline crew members at the agreed rate.",
        compliant: "Y",
        comment: "LRA clause is present and guarantees availability at contracted rates.",
      },
      {
        field: "Payment Terms",
        actual_content:
          "Payment shall be made by the Airline within 30 days of invoice date via direct billing.",
        compliant: "Y",
        comment: "Payment terms are clearly defined with specific timeframe and method.",
      },
      {
        field: "Cancellation Policy",
        actual_content:
          "Cancellations must be made at least 24 hours prior to arrival to avoid charges.",
        compliant: "Y",
        comment: "Cancellation policy is clearly stated with specific timeframe.",
      },
      {
        field: "IROP Rates",
        actual_content: "",
        compliant: "N",
        comment:
          "No IROP (Irregular Operations) rates specified. Should include provisions for emergency/unscheduled operations.",
      },
    ],
    snippets: [
      {
        label: "Parties and Addresses",
        text: "This Agreement is made between SkyFleet Airways, Inc., a corporation organized under the laws of Delaware with its principal office at 123 Aviation Blvd, Chicago, IL 60601 (hereinafter referred to as 'Airline'), and The Riverside Hotel, PQR, located at 456 River Road, Quincy, QNM 12345 (hereinafter referred to as 'Hotel').",
        page_or_section: "Section 1 - Parties",
      },
      {
        label: "Room Rate & Reservations",
        text: "The Hotel agrees to provide rooms for the Airline's crew members at the following rates: Single Occupancy: $89.00 per night, Double Occupancy: $99.00 per night. These rates are inclusive of all taxes and fees. Hotel guarantees last room availability for airline crew members at the agreed rate, regardless of hotel occupancy status.",
        page_or_section: "Section 2(a) - Rates",
      },
      {
        label: "Payment and Billing",
        text: "Payment shall be made by the Airline within 30 days of invoice date via direct billing. The Hotel will provide itemized invoices on a monthly basis. Late payments will incur a 1.5% monthly interest charge.",
        page_or_section: "Section 4 - Payment Terms",
      },
      {
        label: "Cancellation and No-Show Policy",
        text: "Cancellations must be made at least 24 hours prior to the scheduled arrival time to avoid charges. No-shows will be charged for one night's accommodation. The Airline may modify or cancel reservations due to operational requirements with reasonable notice.",
        page_or_section: "Section 5 - Cancellations",
      },
    ],
    flags: {
      missing_fields: ["End Date", "Room Capping", "IROP Rates"],
      ambiguous_points: [
        "Agreement duration is unclear without an end date",
        "No provisions for rate increases or adjustments",
        "Emergency operations procedures not defined",
      ],
    },
  },
};
