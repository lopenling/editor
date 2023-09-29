import React, { Suspense } from 'react';
import { useRecoilState } from 'recoil';
import { HEADER_HEIGHT, RIGHT_SIDEBAR_WIDTH } from '~/constants';
import {
  openSuggestionState,
  selectedPostThread,
  selectedSuggestionThread,
  selectedTextOnEditor,
  showSidebar,
} from '~/states';
import { Await, Outlet, useLoaderData } from '@remix-run/react';
import { FaRegComments } from 'react-icons/fa';
import { Editor } from '@tiptap/react';
import { SuggestionContainer, SuggestionForm } from '../Suggestion';
import Modal from 'react-modal';

type PropsType = {
  editor: Editor | null;
  createPost: any;
  isMobile: boolean;
};

function PostContainer({ editor, createPost, isMobile }: PropsType) {
  const [showPostSide, setShowPostSide] = useRecoilState(showSidebar);
  const [suggestionSelected, suggestionSelector] = useRecoilState(selectedSuggestionThread);
  const [openSuggestion, setOpenSuggestion] = useRecoilState(openSuggestionState);
  const [selectedPost, postSelector] = useRecoilState(selectedPostThread);
  const [selection] = useRecoilState(selectedTextOnEditor);

  const data = useLoaderData();
  let user = data?.user;

  if (isMobile)
    return (
      <Suspense fallback={<div>loading</div>}>
        {/* for mobile devicess */}

        <Await resolve={data.page} errorElement={<p>Error loading package location!</p>}>
          {(page) => {
            return (
              <Modal
                isOpen={showPostSide || !!suggestionSelected?.id || openSuggestion}
                onRequestClose={() => {
                  setShowPostSide(false);
                  setOpenSuggestion(false);
                  suggestionSelector({ id: '' });
                }}
                shouldCloseOnOverlayClick={false}
                ariaHideApp={false}
                className="modal-content pointer-events: auto; z-50 overflow-y-scroll md:hidden w-full"
                overlayClassName="modal-overlay"
              >
                {suggestionSelected?.id || openSuggestion ? (
                  <div className="absolute bottom-0 w-full bg-white max-h-[50dvh] overflow-y-scroll ">
                    <SuggestionSidebar
                      suggestions={data.suggestions}
                      suggestionSelected={suggestionSelected}
                      editor={editor}
                      page={page}
                    ></SuggestionSidebar>
                  </div>
                ) : (
                  <div className="max-h-[50dvh] overflow-y-scroll]">
                    <PostSidebar
                      page={page}
                      user={user}
                      id={selectedPost.id}
                      type={selection.type}
                      showPostSide={showPostSide}
                      editor={editor}
                      createPost={createPost}
                    />
                  </div>
                )}
              </Modal>
            );
          }}
        </Await>
      </Suspense>
    );
  return (
    <div
      style={{
        width: showPostSide ? RIGHT_SIDEBAR_WIDTH : 50,
        top: HEADER_HEIGHT,
      }}
      className={`sticky hidden w-full md:flex transition-all duration-75 z-[1] `}
      id="postContent"
    >
      <Suspense fallback={<div>loading</div>}>
        <Await resolve={data.page} errorElement={<p>Error loading package location!</p>}>
          {(page) => {
            return (
              <>
                {data.text.allow_post && (
                  <button
                    className="absolute rounded-full bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
                    style={{ top: 10, opacity: 1, padding: 10 }}
                    onClick={() => setShowPostSide((p) => !p)}
                  >
                    <FaRegComments size={22} className="cursor-pointer text-gray-500 " />
                  </button>
                )}
                {suggestionSelected?.id || openSuggestion ? (
                  <SuggestionSidebar
                    suggestions={data.suggestions}
                    suggestionSelected={suggestionSelected}
                    page={page}
                    editor={editor}
                  />
                ) : (
                  <div
                    className={`hidden w-full min-w-[450px] flex-col  bg-white  shadow-md dark:bg-gray-700  md:flex   md:h-full md:max-h-full  lg:sticky lg:top-0 lg:h-screen`}
                    style={{
                      opacity: showPostSide ? 1 : 0,
                      transition: 'opacity ease 0.4s',
                    }}
                  >
                    <PostSidebar
                      page={page}
                      user={user}
                      id={selectedPost.id}
                      type={selection.type}
                      showPostSide={showPostSide}
                      editor={editor}
                      createPost={createPost}
                    />
                  </div>
                )}
              </>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

export default PostContainer;

function PostSidebar(props: {
  id: any;
  showPostSide: any;
  type: string;
  user: any;
  editor: any;
  page: any;
  createPost: any;
}) {
  return (
    <Outlet
      context={{
        user: props.user,
        editor: props.editor,
        text: props.page,
        createPost: props.createPost,
      }}
    />
  );
}

function SuggestionSidebar(props: {
  suggestionSelected: { id: any };
  editor: Editor | null;
  suggestions: any;
  page: any;
}) {
  return (
    <div className="z-20 w-full">
      <SuggestionForm editor={props.editor} page={props.page} />
      <Suspense fallback={<div>loading</div>}>
        <Await resolve={props.suggestions}>
          {(data) => <SuggestionContainer editor={props.editor} suggestions={data} />}
        </Await>
      </Suspense>
    </div>
  );
}