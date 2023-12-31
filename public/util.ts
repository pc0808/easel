type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

const operations: operation[] = [
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Update User",
    endpoint: "/api/users",
    method: "PATCH",
    fields: { update: { username: "input", password: "input" } },
  },
  {
    name: "Delete User",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Get Users",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: "input" },
  },

  // PROFILE 

  {
    name: "Get Profile by Username",
    endpoint: "/api/profiles/:username",
    method: "GET",
    fields: { username: "input" },
  },
  {
    name: "Update Profile",
    endpoint: "/api/profiles",
    method: "PATCH",
    fields: { update: { avatar: "input", biography: "input" } },
  },
  // POSTS 


  {
    name: "Get Posts (empty for all)",
    endpoint: "/api/posts",
    method: "GET",
    fields: { author: "input" },
  },
  {
    name: "Get Post by ID",
    endpoint: "/api/posts/:id",
    method: "GET",
    fields: { id: "input" },
  },
  {
    name: "Create Post",
    endpoint: "/api/posts",
    method: "POST",
    fields: { caption: "input", content: "input" },
  },
  {
    name: "Update Post",
    endpoint: "/api/posts/:id",
    method: "PATCH",
    fields: { id: "input", update: { caption: "input", content: "input" } },
  },
  {
    name: "Delete Post",
    endpoint: "/api/posts/:id",
    method: "DELETE",
    fields: { id: "input" },
  },

  // BOARDS 

  {
    name: "Create Board",
    endpoint: "/api/boards",
    method: "POST",
    fields: { caption: "input" },
  },
  {
    name: "Get Boards",
    endpoint: "/api/boards",
    method: "GET",
    fields: { author: "input" },
  },
  {
    name: "Get Board by ID",
    endpoint: "/api/boards/:id",
    method: "GET",
    fields: { id: "input" },
  },
  {
    name: "Add Post to Board",
    endpoint: "api/boards/:board&:post",
    method: "PATCH",
    fields: { board: "input", post: "input" },
  },
  {
    name: "Delete Post from Board",
    endpoint: "api/boards/:board&:post",
    method: "PUT",
    fields: { board: "input", post: "input" },
  },
  {
    name: "Delete Board",
    endpoint: "/api/boards/:id",
    method: "DELETE",
    fields: { id: "input" },
  },

  // TAGS

  {
    name: "Get Tags of Posts (Post ID)",
    endpoint: "/api/tags/posts",
    method: "PATCH",
    fields: { filter: { tagName: "input", content: "input" } },
  },
  {
    name: "Get Tags of Boards (Board ID)",
    endpoint: "/api/tags/boards",
    method: "PATCH",
    fields: { filter: { tagName: "input", content: "input" } },
  },
  {
    name: "Add Tag to Post",
    endpoint: "api/tags/posts/:tagName&:id",
    method: "POST",
    fields: { tagName: "input", id: "input" },
  },
  {
    name: "Add Tag to Board",
    endpoint: "api/tags/boards/:tagName&:id",
    method: "POST",
    fields: { tagName: "input", id: "input" },
  },
  {
    name: "Delete Tag from Post",
    endpoint: "api/tags/posts/:tagName&:post",
    method: "DELETE",
    fields: { tagName: "input", post: "input" },
  },
  {
    name: "Delete Tag from Board",
    endpoint: "api/tags/boards/:tagName&:board",
    method: "DELETE",
    fields: { tagName: "input", board: "input" },
  },

  // FOLLOWING 

  {
    name: "Get Following List",
    endpoint: "api/following/:username",
    method: "GET",
    fields: { username: "input" }
  },
  {
    name: "Get Followers List",
    endpoint: "api/followers/:username",
    method: "GET",
    fields: { username: "input" }
  },
  {
    name: "Follow User",
    endpoint: "api/following/:username",
    method: "POST",
    fields: { username: "input" }
  },
  {
    name: "Unfollow User",
    endpoint: "api/followers/:username",
    method: "POST",
    fields: { username: "input" }
  },
];

// Do not edit below here.
// If you are interested in how this works, feel free to ask on forum!

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${tag} name="${prefix}${name}"></${tag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (!value) {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
