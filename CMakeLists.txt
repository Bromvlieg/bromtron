cmake_minimum_required (VERSION 3.8)

include(FetchContent)

set(BT_VERSION_MAJOR 0 CACHE STRING "major version" FORCE)
set(BT_VERSION_MINOR 1 CACHE STRING "minor version" FORCE)
set(BT_VERSION ${BT_VERSION_MAJOR}.${BT_VERSION_MINOR} CACHE STRING "version" FORCE)
set(BT_DOWNLOAD_MAINFRAME true CACHE BOOL "use mainframe from git repo" FORCE)

project ("BT" VERSION ${BT_VERSION})

# libraries
set(BUILD_TESTING OFF)
set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(freetype-gl_BUILD_APIDOC OFF CACHE BOOL "" FORCE)
set(freetype-gl_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(freetype-gl_BUILD_DEMOS OFF CACHE BOOL "" FORCE)
set(freetype-gl_BUILD_MAKEFONT OFF CACHE BOOL "" FORCE)
set(freetype-gl_USE_VAO ON CACHE BOOL "" FORCE)

find_package(nlohmann_json REQUIRED)
find_package(freetype REQUIRED)
find_package(curl REQUIRED)

FetchContent_Declare(fmtlib
	GIT_REPOSITORY https://github.com/fmtlib/fmt.git
)
FetchContent_MakeAvailable(fmtlib)

FetchContent_Declare(freetype-gl
	GIT_REPOSITORY https://github.com/rougier/freetype-gl.git
)
FetchContent_MakeAvailable(freetype-gl)

set(BT_DOWNLOAD_MAINFRAME false)
if (BT_DOWNLOAD_MAINFRAME)
	FetchContent_Declare(mainframe
		GIT_REPOSITORY http://gerrit.4o6.nl/mainframe
	)
	FetchContent_MakeAvailable(mainframe)
else()
	add_subdirectory ("mainframe")
endif()

file(GLOB_RECURSE source_files
	"src/*.cpp"
	"src/*.c"
	"include/*.hpp"
)

set(output_target bromtron)
add_executable(${output_target} ${source_files})
target_include_directories(${output_target} PUBLIC "include")
target_compile_features(${output_target} PRIVATE cxx_std_17)
target_link_libraries(${output_target} PRIVATE
	mainframe.math
	mainframe.utils
	mainframe.networking
	mainframe.ui
	mainframe.game
	mainframe.render
	fmt::fmt
	nlohmann_json::nlohmann_json
	CURL::libcurl
)


if (WIN32)
	file(GLOB_RECURSE sdkdlls "dlls/*.dll")

	foreach(dll IN LISTS sdkdlls)
		get_filename_component(barename ${dll} NAME)
		message("copying dll:" ${barename})

		add_custom_command(TARGET ${output_target} POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different ${dll} ${PROJECT_SOURCE_DIR}/exec/${barename})
	endforeach()

	add_custom_command(TARGET ${output_target} POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_BINARY_DIR}/${output_target}.exe ${PROJECT_SOURCE_DIR}/exec/${output_target}.exe)
else()
	add_custom_command(TARGET ${output_target} POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_BINARY_DIR}/${output_target} ${PROJECT_SOURCE_DIR}/exec/${output_target})
endif()

file(GLOB_RECURSE BT_CONTENT_DATA "data/*")
file(GLOB_RECURSE BT_CONTENT_FONTS "fonts/*")
file(GLOB_RECURSE BT_CONTENT_TEXTURES "textures/*")
set(BT_CONTENT ${BT_CONTENT_DATA} ${BT_CONTENT_FONTS} ${BT_CONTENT_TEXTURES})

foreach(contentfile IN LISTS BT_CONTENT)
	STRING(REGEX REPLACE ${PROJECT_SOURCE_DIR} "" contentfile_stripped ${contentfile})
	message("detected content:" ${contentfile_stripped})

	add_custom_command(TARGET ${output_target} POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different ${contentfile} ${PROJECT_SOURCE_DIR}/exec${contentfile_stripped})
endforeach()