import { Suspense } from "react";
import PostForm from "~/component/PostContainer/PostForm";
import Skeleton from "~/component/PostContainer/Skeleton";
import { Await, useLoaderData, useOutletContext } from "@remix-run/react";
import Posts from "~/component/PostContainer/Posts";
import filterIcon from "~/assets/svg/icon_filter.svg";
import sortIcon from "~/assets/svg/icon_sort.svg";
import floatingSortIcon from "~/assets/svg/icon_floatingSortIcon.svg";
import { Dropdown } from "flowbite-react";
import { uselitteraTranlation } from "~/locales/translations";
import { useRecoilState } from "recoil";
import { openFilterState, showLatest } from "~/states";
import { findPostByTextId } from "~/model/post";
import { LoaderFunction, defer } from "@remix-run/cloudflare";
import { fetchCategoryData } from "~/services/discourseApi";
import { Editor } from "@tiptap/react";
import { getUserSession } from "~/services/session.server";
export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const selectedPost = url.searchParams.get("post");
  const textId = parseInt(params.textId);
  const CategoryData = await fetchCategoryData();
  const topicList = CategoryData.topic_list.topics;
  const posts = findPostByTextId(textId, topicList);
  return defer({ posts, selectedPost, text: { id: textId } });
};

export default function Post() {
  const [isLatestPost, setIsLatestPost] = useRecoilState(showLatest);
  const [, setOpenFilter] = useRecoilState(openFilterState);
  const translation = uselitteraTranlation();
  const data = useLoaderData();
  const posts = data.posts;
  const { editor }: { editor: Editor } = useOutletContext();
  return (
    <div className=" relative sm:w-full lg:w-1/3">
      <div className="hidden w-full items-center justify-end md:inline-flex gap-2">
        {/* sort button */}
        <Dropdown
          label={
            <>
              <img src={sortIcon} alt="sortIcon" />
              <span className="ml-2 text-sm font-medium leading-tight text-gray-500">
                sort By
              </span>
            </>
          }
          size="sm"
          color="white"
          className="outline-1 outline-gray-300 outline"
          dismissOnClick={false}
        >
          <Dropdown.Item
            className={isLatestPost && "bg-green-300"}
            onClick={() => setIsLatestPost(true)}
          >
            Latest
          </Dropdown.Item>
          <Dropdown.Item
            className={!isLatestPost && "bg-green-300"}
            onClick={() => setIsLatestPost(false)}
          >
            Earliest
          </Dropdown.Item>
        </Dropdown>
        {/* filter button */}
        <button
          id="filterButton"
          onClick={() => setOpenFilter((prev) => !prev)}
          className="flex items-center justify-center space-x-2 rounded-lg border border-gray-200 px-3 py-2"
        >
          <img src={filterIcon} alt="filterIcon" />
          <span className="text-sm font-medium leading-tight text-gray-500">
            {translation.filter}
          </span>
        </button>
      </div>
      <div
        className="fixed bottom-2 right-3 z-40 cursor-pointer md:hidden"
        onClick={() => setOpenFilter((prev) => !prev)}
      >
        <img src={floatingSortIcon} alt="floatingSortIcon" />
      </div>
      <PostForm />

      {/* used differ at loader for post list to fetch posts as a promise */}
      <Suspense fallback={<Skeleton />}>
        <Await resolve={posts} errorElement={<p>Error loading posts!</p>}>
          <Posts editor={editor} />
        </Await>
      </Suspense>
    </div>
  );
}