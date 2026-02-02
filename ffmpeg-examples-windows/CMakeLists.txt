# ffmpeg-examples-windows - 作为 sherpa-onnx 的子模块构建
# 注意：不要在这里使用 project() 命令，因为它需要访问父项目的目标

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/..)

message(STATUS "Configuring ffmpeg-examples-windows")
message(STATUS "CMAKE_CURRENT_SOURCE_DIR: ${CMAKE_CURRENT_SOURCE_DIR}")
message(STATUS "FFMPEG_INCLUDE_DIR at start: ${FFMPEG_INCLUDE_DIR}")
message(STATUS "FFMPEG_LIBRARIES at start: ${FFMPEG_LIBRARIES}")

find_package(PkgConfig QUIET)

if(PKG_CONFIG_FOUND)
    pkg_check_modules(FFMPEG REQUIRED
        libavdevice
        libavformat
        libavfilter
        libavcodec
        libswresample
        libswscale
        libavutil
    )
else()
    message(STATUS "pkg-config not found. Please manually set FFMPEG_INCLUDE_DIR and FFMPEG_LIBRARIES")
    
    # 如果父项目已经定义了这些变量，则使用父项目的值
    # 否则使用默认值
    if(NOT FFMPEG_INCLUDE_DIR)
        set(FFMPEG_INCLUDE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/ffmpeg/include" CACHE PATH "FFmpeg include directory")
    endif()
    
    if(NOT FFMPEG_LIBRARIES)
        set(FFMPEG_LIBRARIES "${CMAKE_CURRENT_SOURCE_DIR}/ffmpeg/lib" CACHE PATH "FFmpeg libraries directory")
    endif()
    
    message(STATUS "FFMPEG_INCLUDE_DIR: ${FFMPEG_INCLUDE_DIR}")
    message(STATUS "FFMPEG_LIBRARIES: ${FFMPEG_LIBRARIES}")
    
    # 验证 FFmpeg 路径是否存在
    if(NOT EXISTS ${FFMPEG_INCLUDE_DIR})
        message(FATAL_ERROR "FFmpeg include directory not found: ${FFMPEG_INCLUDE_DIR}")
    endif()
    if(NOT EXISTS ${FFMPEG_LIBRARIES})
        message(FATAL_ERROR "FFmpeg lib directory not found: ${FFMPEG_LIBRARIES}")
    endif()
    
    include_directories(${FFMPEG_INCLUDE_DIR})
    link_directories(${FFMPEG_LIBRARIES})
endif()

add_executable(sherpa-onnx-ffmpeg sherpa-onnx-ffmpeg.c)

target_link_libraries(sherpa-onnx-ffmpeg
    PRIVATE
    sherpa-onnx-c-api
    onnxruntime
)

if(PKG_CONFIG_FOUND)
    target_link_libraries(sherpa-onnx-ffmpeg PRIVATE ${FFMPEG_LIBRARIES})
    target_include_directories(sherpa-onnx-ffmpeg PRIVATE ${FFMPEG_INCLUDE_DIRS})
else()
    target_link_libraries(sherpa-onnx-ffmpeg PRIVATE
        avdevice
        avformat
        avfilter
        avcodec
        swresample
        swscale
        avutil
    )
endif()

if(WIN32)
    target_link_libraries(sherpa-onnx-ffmpeg PRIVATE ws2_32)
endif()

# 设置输出目录 - 使用 CMAKE_RUNTIME_OUTPUT_DIRECTORY 确保与主项目一致
set_target_properties(sherpa-onnx-ffmpeg PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}"
)
