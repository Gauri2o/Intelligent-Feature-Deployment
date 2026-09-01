import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  describe,
  test,
  expect,
  beforeEach,
  vi,
} from "vitest";

import userEvent from "@testing-library/user-event";

import {
  MemoryRouter,
} from "react-router-dom";

import FlagPage from "../pages/FlagPage";

import api from "../services/api";


// =========================================================
// MOCK API
// =========================================================

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));


// =========================================================
// TEST DATA
// =========================================================

const environments = [
  {
    id: 1,
    name: "Development",
  },
];

const flags = [
  {
    id: 1,
    flag_key: "dark_mode",
    type: "boolean",
    enabled: true,
    owner_team: "Frontend Team",
    environment_id: 1,
  },
];


// =========================================================
// HELPER
// =========================================================

function renderFlagPage() {
  return render(
    <MemoryRouter>
      <FlagPage />
    </MemoryRouter>
  );
}


// =========================================================
// RESET
// =========================================================

beforeEach(() => {
  vi.clearAllMocks();

  localStorage.clear();

  localStorage.setItem(
    "environment_id",
    "1"
  );
});


// =========================================================
// TEST 1
// NORMAL STATE
// =========================================================

describe(
  "FlagPage - Normal State",
  () => {

    test(
      "renders flags successfully",
      async () => {

        api.get
          .mockResolvedValueOnce({
            data: flags,
          })
          .mockResolvedValueOnce({
            data: environments,
          });


        renderFlagPage();


        // -------------------------------------------------
        // Page heading
        // -------------------------------------------------

        expect(
          await screen.findByText(
            "Feature Flags"
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Feature flag
        // -------------------------------------------------

        expect(
          screen.getByText(
            "dark_mode"
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Owner
        // -------------------------------------------------

        expect(
          screen.getByText(
            "Frontend Team"
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Type
        // -------------------------------------------------

        expect(
          screen.getByText(
            "boolean"
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Environment
        //
        // "Development" appears twice:
        // 1. Environment pill
        // 2. Environment badge in table
        // -------------------------------------------------

        expect(
          screen.getAllByText(
            "Development"
          )
        ).toHaveLength(2);


        // -------------------------------------------------
        // Status
        //
        // "Enabled" appears twice:
        // 1. Statistics card
        // 2. Flag status badge
        // -------------------------------------------------

        expect(
          screen.getAllByText(
            "Enabled"
          )
        ).toHaveLength(2);


        // -------------------------------------------------
        // Statistics
        // -------------------------------------------------

        expect(
          screen.getByText(
            "Total Flags"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            "Disabled"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            "Environments"
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Create button
        // -------------------------------------------------

        expect(
          screen.getByText(
            "Create Flag"
          )
        ).toBeInTheDocument();

      }
    );

  }
);


// =========================================================
// TEST 2
// EMPTY STATE
// =========================================================

describe(
  "FlagPage - Empty State",
  () => {

    test(
      "shows empty state when no flags exist",
      async () => {

        api.get
          .mockResolvedValueOnce({
            data: [],
          })
          .mockResolvedValueOnce({
            data: environments,
          });


        renderFlagPage();


        // -------------------------------------------------
        // Empty heading
        // -------------------------------------------------

        expect(
          await screen.findByText(
            "No flags found"
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Empty message
        // -------------------------------------------------

        expect(
          screen.getByText(
            "No feature flags exist in the Development environment."
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Create first flag
        // -------------------------------------------------

        expect(
          screen.getByText(
            "+ Create your first flag"
          )
        ).toBeInTheDocument();

      }
    );

  }
);


// =========================================================
// TEST 3
// SEARCH
// =========================================================

describe(
  "FlagPage - Search",
  () => {

    test(
      "shows search empty state when no flag matches",
      async () => {

        api.get
          .mockResolvedValueOnce({
            data: flags,
          })
          .mockResolvedValueOnce({
            data: environments,
          });


        renderFlagPage();


        // -------------------------------------------------
        // Wait for flag to load
        // -------------------------------------------------

        expect(
          await screen.findByText(
            "dark_mode"
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Find search input
        // -------------------------------------------------

        const searchInput =
          screen.getByPlaceholderText(
            "Search flags, owners..."
          );


        // -------------------------------------------------
        // Search random value
        // -------------------------------------------------

        await userEvent.type(
          searchInput,
          "xyzabc123"
        );


        // -------------------------------------------------
        // Empty search result
        // -------------------------------------------------

        expect(
          await screen.findByText(
            "No flags found"
          )
        ).toBeInTheDocument();


        expect(
          screen.getByText(
            "Try a different search term."
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Original flag should disappear
        // -------------------------------------------------

        expect(
          screen.queryByText(
            "dark_mode"
          )
        ).not.toBeInTheDocument();

      }
    );

  }
);


// =========================================================
// TEST 4
// API FAILURE
// =========================================================

describe(
  "FlagPage - API Failure",
  () => {

    test(
      "handles API failure gracefully",
      async () => {

        // Silence expected console.error
        const consoleError =
          vi
            .spyOn(
              console,
              "error"
            )
            .mockImplementation(
              () => {}
            );


        // -------------------------------------------------
        // Simulate backend failure
        // -------------------------------------------------

        api.get.mockRejectedValue(
          new Error(
            "Backend unavailable"
          )
        );


        renderFlagPage();


        // -------------------------------------------------
        // Loading should finish
        // -------------------------------------------------

        await waitFor(
          () => {

            expect(
              screen.queryByText(
                "Loading Feature Flags"
              )
            ).not.toBeInTheDocument();

          }
        );


        // -------------------------------------------------
        // Component should not crash
        // -------------------------------------------------

        expect(
          screen.getByText(
            "Feature Flags"
          )
        ).toBeInTheDocument();


        // -------------------------------------------------
        // Error should be logged
        // -------------------------------------------------

        expect(
          consoleError
        ).toHaveBeenCalled();


        consoleError.mockRestore();

      }
    );

  }
);