FROM ubuntu:latest

# Install build dependencies
RUN apt-get update && \
    apt-get install -y wget

# Fetch the installer for the latest TeX Live
RUN wget http://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz && \
    tar -xvf install-tl-unx.tar.gz && \
    rm install-tl-unx.tar.gz && \
    mv install-tl-* install-tl

# Run the installer with the "basic" profile (it's "only" ~200 MB, as opposed to the "full" ~4 GB)
WORKDIR /install-tl
RUN echo "selected_scheme scheme-basic" > scheme-basic.profile && \
    ./install-tl --profile=scheme-basic.profile
RUN ln -s /usr/local/texlive/*/bin/x86_64-linux/* /usr/local/bin/

# Install a bunch of TeX Live packages (these will vary according to your needs)
RUN tlmgr install \
    subfigure titlesec multirow lastpage etoolbox textpos hyphen-finnish \
    hyphen-swedish babel-finnish babel-swedish eurosym pgf ms xcolor

RUN mkdir /workdir
WORKDIR /workdir
ENTRYPOINT ["pdflatex"]
