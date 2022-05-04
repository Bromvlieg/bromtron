cmake_minimum_required (VERSION 3.8)

include(FetchContent)

set(BT_VERSION_MAJOR 0 CACHE STRING "major version" FORCE)
set(BT_VERSION_MINOR 1 CACHE STRING "minor version" FORCE)
set(BT_VERSION ${BT_VERSION_MAJOR}.${BT_VERSION_MINOR} CACHE STRING "version" FORCE)
set(BT_DOWNLOAD_MAINFRAME true CACHE BOOL "use mainframe from git repo" FORCE)

project ("BT" VERSION ${BT_VERSION})

# conan for libaries
if(NOT EXISTS "${CMAKE_BINARY_DIR}/conan.cmake")
   message(STATUS "Downloading conan.cmake from https://github.com/conan-io/cmake-conan")
   file(DOWNLOAD "https://gist.githubusercontent.com/Bromvlieg/eb8564c44726fd985f3c26d929d2f1f3/raw/1d79995a9e6359e5e98499b268ea53850fbbf088/conan.cmake"
                  "${CMAKE_BINARY_DIR}/conan.cmake")
endif()

include(${CMAKE_BINARY_DIR}/conan.cmake)

if(CMAKE_COMPILER_IS_GNUXX)
   set(CONAN_SETTINGS compiler.libcxx=libstdc++11)
endif()

conan_cmake_run(CONANFILE conanfile.txt
                SETTINGS ${CONAN_SETTINGS}
                BUILD missing)

include(${CMAKE_BINARY_DIR}/conan_paths.cmake)

find_package(CURL REQUIRED)
find_package(nlohmann_json)

FetchContent_GetProperties(mainframe)
if(NOT mainframe_POPULATED)
	FetchContent_Declare(mainframe
		GIT_REPOSITORY https://github.com/Goofy-Penguin/Mainframe.git
	)

	FetchContent_MakeAvailable(mainframe)
endif()

file(GLOB_RECURSE source_files
	"src/*.cpp"
	"src/*.c"
	"include/*.h"
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
	CURL::libcurl
	nlohmann_json::nlohmann_json
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